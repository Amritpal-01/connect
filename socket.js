"use client";

import { io } from "socket.io-client";


export const socket = io("https://socket-io-for-connect-y.onrender.com");
// export const socket = io("http://localhost:5500/");