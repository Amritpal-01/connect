/** @format */

"use client";

import { createContext, useEffect, useState, useContext, useRef } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";
import { openDB } from "idb";
import { redirect } from "next/navigation";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { userData, fetchUserData } = useAuth();
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isloadingMessages, setIsloadingMessages] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [db, setDb] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const localStream = useRef(null);
  const peer = useRef(null);
  const pendingCandidates = useRef([]);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const updateFriendProfile = async () => {
    let response = await fetch("/api/updateFriendData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        friendUid: activeFriend.uid,
        userUid: userData.uid,
      }),
    });
  };

  useEffect(() => {
    if (!activeFriend) return;
    updateFriendProfile();
  }, [activeFriend]);

  useEffect(() => {
    async function initDB() {
      // indexedDB.deleteDatabase("ChatDB");
      const dbInstance = await openDB("ChatDB", 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("rooms")) {
            db.createObjectStore("rooms", { keyPath: "id" });
          }
        },
      });

      setDb(dbInstance);
      console.log("DB ready");
    }

    initDB();
  }, []);

  const getMessages = async () => {
    setIsloadingMessages(true);
    setMessages([]);

    const room = activeFriend.roomId;

    let currentRoom;

    try {
      currentRoom = await db.get("rooms", room);
      if (!currentRoom) throw new Error("room not found");
    } catch {
      console.log("room not found");
      await db.add("rooms", {
        id: room,
        messages: [],
      });
      currentRoom = await db.get("rooms", room); // 🟢 Re-fetch after adding
    }

    let newRoom = currentRoom;

    const oldMessages = currentRoom.messages;
    const newMessages = activeFriend.unSeenMessages;

    newRoom.messages = [...oldMessages, ...newMessages];

    await db.put("rooms", newRoom);

    setMessages(newRoom.messages);
    setIsloadingMessages(false);

    userData.friends.map(async (friend) => {
      if (friend == activeFriend) {
        friend.unSeenMessages = [];

        let response = await fetch("/api/deleteMessages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            friendname: activeFriend.username,
            username: userData.username,
          }),
        });

        deleteSeenMessage(friend.username);
      }
    });
  };

  useEffect(() => {
    if (!db) return;
    if (!activeFriend) return;
    getMessages();
  }, [activeFriend, db]);

  useEffect(() => {
    if (!userData) return;

    const onConnect = () => {
      console.log("connected");
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      if (!isSocketConnected) {
        setIsSocketConnected(true);
      }

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    };

    const handleConnectError = (error) => {
      console.log("not Connected");
      if (isSocketConnected) {
        setIsSocketConnected(false);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setTransport("N/A");
    };

    const onReceiveMessage = async ({ message, roomId, forWhome }) => {
      console.log("message");

      if (activeFriend?.username == message.sender) {
        let currentRoom;
        try {
          currentRoom = await db.get("rooms", roomId);
          if (!currentRoom) throw new Error("room not found");
        } catch {
          await db.add("rooms", {
            id: room,
            messages: [],
          });
          currentRoom = await db.get("rooms", roomId); // 🟢 Re-fetch after adding
        }

        let newRoom = currentRoom;

        const oldMessages = currentRoom.messages;
        const newMessages = message;

        newRoom.messages = [...oldMessages, newMessages];

        await db.put("rooms", newRoom);
      }

      setMessages((prevMessages) => [...prevMessages, message]);

      if (message.sender == activeFriend?.username) return;

      userData.friends.map((friend) => {
        if (message.sender === friend.username) {
          friend.lastMessage = message;
          const oldUnSeenMessages = friend.unSeenMessages;
          friend.unSeenMessages = [...oldUnSeenMessages, message];
        }
      });
    };

    const onFr = () => {
      fetchUserData();
    };

    const deleteUnSeenMessages = async ({ from }) => {
      if (activeFriend?.username == from) {
        let response = await fetch("/api/deleteMessages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            friendname: from,
            username: userData.username,
          }),
        });
      }
    };

    if (socket.connected) {
      onConnect(); // manually call the handler if already connected
    }

    socket.on("receivePrivateFriendRequest", onFr);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receivePrivateMessage", onReceiveMessage);
    socket.on("receiveDeleteSeenMessage", deleteUnSeenMessages);
    socket.on("connect_error", handleConnectError);

    socket.on("recieveOffer", async ({ offer, from }) => {
      console.log("Received offer from", from);

      answerCall({ offer, from });
    });

    socket.on("receiveAnswer", async ({ answer }) => {
      console.log("Received answer");

      // Check if peer connection exists
      if (!peer.current) {
        console.error("Peer connection not found when receiving answer");
        return;
      }

      try {
        await peer.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        // Process any pending ICE candidates
        await processPendingCandidates();
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      console.log("Received ICE candidate from:", from);

      if (!candidate) {
        console.log("No candidate received");
        return;
      }

      // Check if peer connection exists
      if (!peer.current) {
        console.log("Peer connection not found, storing candidate for later");
        pendingCandidates.current.push(candidate);
        return;
      }

      try {
        const iceCandidate = new RTCIceCandidate(candidate);

        if (peer.current.remoteDescription) {
          // Remote description is set, add the candidate immediately
          console.log("Adding ICE candidate immediately");
          await peer.current.addIceCandidate(iceCandidate);
        } else {
          // Remote description not set yet, store for later
          console.log("Remote description not set, storing candidate for later");
          pendingCandidates.current.push(candidate);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
        // If adding fails, store for later
        pendingCandidates.current.push(candidate);
      }
    });

    socket.emit("register", userData.username);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receivePrivateMessage", onReceiveMessage);
      socket.off("receivePrivateFriendRequest", onFr);
      socket.off("receiveDeleteSeenMessage", deleteUnSeenMessages);
      socket.off("connect_error", handleConnectError);
      socket.off("recieveOffer");
      socket.off("receiveAnswer");
      socket.off("ice-candidate");
    };
  }, [userData, activeFriend, peer]);

  const sendPrivateMessage = async (message) => {
    let currentRoom = await db.get("rooms", activeFriend.roomId);

    if (!currentRoom) {
      currentRoom = await db.add("rooms", {
        id: activeFriend.roomId,
        messages: [],
      });
    }

    let newRoom = currentRoom;

    const oldMessages = currentRoom.messages;
    const newMessages = message;

    newRoom.messages = [...oldMessages, newMessages];

    await db.put("rooms", newRoom);

    socket.emit("privateMessage", {
      from: userData.username,
      to: activeFriend.username,
      roomId: activeFriend.roomId,
      message,
    });
  };

  const sendFriendRequstThroughSocket = (friendname) => {
    socket.emit("privateFriendRequest", {
      to: friendname,
    });
  };

  const deleteSeenMessage = async ({ friendname, username }) => {
    socket.emit("deleteSeenMessage", {
      to: friendname,
      from: username,
    });
  };

  const call = async (friend) => {
    console.log("calling : " + friend.displayName);
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }

    // Cleanup any existing peer connection
    if (peer.current) {
      console.log("Cleaning up existing peer connection");
      cleanupPeerConnection();
    }

    // step-one get localMedia --->

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    // if (localVideo.current) {
    //   localVideo.current.srcObject = stream;
    // }

    // step-two setUp new peer connection --->

    peer.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }], //
    });

    console.log("Peer connection created for caller");

    // Add connection state change handler
    peer.current.onconnectionstatechange = () => {
      console.log("Connection state:", peer.current.connectionState);
      if (peer.current.connectionState === 'connected') {
        console.log("WebRTC connection established!");
      } else if (peer.current.connectionState === 'failed') {
        console.error("WebRTC connection failed");
      }
    };

    // Add ICE connection state change handler
    peer.current.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peer.current.iceConnectionState);
    };

    // add track to share in new peer connection (peer.current.addTrack())

    stream.getTracks().forEach((track) => {
      peer.current.addTrack(track, stream);
    });

    // eventListener is added on ICE candidate witch is shared the minute the offer is sent!!
    peer.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate");
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: friend.username,
          from: userData.username,
        });
      }
    };

    // remoteStream variable is setUp

    const remoteStream = new MediaStream();
    // remoteVideo.current.srcObject = remoteStream;

    // another evenListerner is added to ontrack which is recived from the answer

    peer.current.ontrack = (event) => {
      console.log("Track received:", event.track);
      const newRemoteStream = new MediaStream();
      newRemoteStream.addTrack(event.track);
      setRemoteStream(newRemoteStream);
    };

    // offer is created
    try {
      const offer = await peer.current.createOffer();

      // local offer is set
      await peer.current.setLocalDescription(offer);

      //offer is shared
      socket.emit("offer", {
        offer: offer,
        to: friend.username,
        from: userData.username,
      });

      console.log("Sent offer to", friend.username);
    } catch (error) {
      console.error("Error creating or sending offer:", error);
    }
  };

  const answerCall = async ({ offer, from }) => {

    setActiveFriend(null);

    let friends = userData.friends;

    let caller = null;

    friends.map(friend => {
      if (friend.username === from) {
        setActiveCall(friend)
        caller = friend;
      }
    })

    if (!caller) return;

    console.log("calling : " + caller.username);
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }

    // Cleanup any existing peer connection
    if (peer.current) {
      console.log("Cleaning up existing peer connection");
      cleanupPeerConnection();
    }

    // step-one get localMedia --->

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    // if (localVideo.current) {
    //   localVideo.current.srcObject = stream;
    // }

    // step-two setUp new peer connection --->

    peer.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }], //
    });

    console.log("Peer connection created for answerer");

    // Add connection state change handler
    peer.current.onconnectionstatechange = () => {
      console.log("Connection state:", peer.current.connectionState);
      if (peer.current.connectionState === 'connected') {
        console.log("WebRTC connection established!");
      } else if (peer.current.connectionState === 'failed') {
        console.error("WebRTC connection failed");
      }
    };

    // Add ICE connection state change handler
    peer.current.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peer.current.iceConnectionState);
    };

    // add track to share in new peer connection (peer.current.addTrack())

    stream.getTracks().forEach((track) => {
      peer.current.addTrack(track, stream);
    });

    // eventListener is added on ICE candidate witch is shared the minute the offer is sent!!
    peer.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate");
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: caller.username,
          from: userData.username,
        });
      }
    };

    // remoteStream variable is setUp

    const remoteStream = new MediaStream();
    // remoteVideo.current.srcObject = remoteStream;

    // another evenListerner is added to ontrack which is recived from the answer

    peer.current.ontrack = (event) => {
      console.log("Track received:", event.track);
      const newRemoteStream = new MediaStream();
      newRemoteStream.addTrack(event.track);
      setRemoteStream(newRemoteStream);
    };

    // remote offer is set
    try {
      await peer.current.setRemoteDescription(new RTCSessionDescription(offer));

      // answer is created
      const answer = await peer.current.createAnswer();

      // local offer is set
      await peer.current.setLocalDescription(answer);

      //the answer is sent
      socket.emit("answer", { answer, to: from, from: userData.username });

      console.log("Sent answer to", from);

      // Process any pending ICE candidates
      await processPendingCandidates();
    } catch (error) {
      console.error("Error processing answer:", error);
    }
    
    redirect("/call");
  };

  // Helper function to process pending ICE candidates
  const processPendingCandidates = async () => {
    if (!peer.current || pendingCandidates.current.length === 0) return;

    console.log(`Processing ${pendingCandidates.current.length} pending candidates`);

    for (const candidate of pendingCandidates.current) {
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        await peer.current.addIceCandidate(iceCandidate);
        console.log("Added pending ICE candidate");
      } catch (error) {
        console.error("Error adding pending ICE candidate:", error);
      }
    }
    pendingCandidates.current = [];
  };

  // Helper function to cleanup peer connection
  const cleanupPeerConnection = () => {
    if (peer.current) {
      peer.current.close();
      peer.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    pendingCandidates.current = [];
    setRemoteStream(null);
    setActiveCall(null);
    console.log("Peer connection cleaned up");
  };

  return (
    <ChatContext.Provider
      value={{
        activeFriend,
        setActiveFriend,
        messages,
        setMessages,
        sendPrivateMessage,
        isloadingMessages,
        sendFriendRequstThroughSocket,
        deleteSeenMessage,
        db,
        isSocketConnected,
        activeCall,
        setActiveCall,
        call,
        remoteStream,
        localStream: localStream.current,
        cleanupPeerConnection,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);