import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMessageSquare, 
  FiX, 
  FiSend, 
  FiPaperclip, 
  FiSmile,
  FiChevronLeft,
  FiSearch,
  FiMoreVertical,
  FiUser
} from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';
import { BsThreeDotsVertical, BsEmojiSmile, BsMicFill } from 'react-icons/bs';
import { RiSendPlaneFill } from 'react-icons/ri';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const ChatComponent = ({ 
  isEquipmentChat = false, 
  product = null, 
  onClose = null,
  showBackButton = false,
  onBack = null
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoom, setChatRoom] = useState(null);
  const [ws, setWs] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [receivers, setReceivers] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProfilereceiver = async (receiver_id) => {
    try {
      if (!receiver_id) {
        throw new Error("User ID is missing");
      }

      const response = await axios.get(`http://127.0.0.1:8000/profile/profil/?user=${receiver_id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetchProfilereceiver(userId);
      
      // Parse response: If it's a Response object (from fetch), convert to JSON
      const profile = response?.json ? await response.json() : response;
      console.log('Parsed profile:', profile);
  
      // Handle array response (e.g., [{...}]) or object ({...})
      const profileData = Array.isArray(profile) ? profile[0] : profile;
  
      // Check if profileData is valid
      if (!profileData || !profileData.first_name) {
        return {
          username: `User ${userId?.slice(0, 5)}`,
          first_name: `User ${userId?.slice(0, 5)}`,
          last_name: '',
          profile_picture: null,
          
        };
      }
  
      // Return formatted user data
      return {
        username: `${profileData.first_name} ${profileData.last_name || ''}`,
        first_name: profileData.first_name,
        last_name: profileData.last_name || '',
        profile_picture: profileData.profile_picture || null,  // Optional field
        user_id: profileData?.user_id
      };
    } catch (err) {
      console.error("Error fetching user details:", err);
      return {
        username: `User ${userId?.slice(0, 5)}`,
        first_name: `User ${userId?.slice(0, 5)}`,
        last_name: '',
        profile_picture: null
      };
    }
  };
  

  useEffect(() => {
    if (isEquipmentChat) return;

    const fetchChatRoomsAndReceivers = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8001/api/chat/chat/user/${user.user_id}/`,
          { withCredentials: true }
        );
        
        setChatRooms(response.data.chatrooms);
        
        const receiversData = await Promise.all(
          response.data.chatrooms.map(async (room) => {
            const otherUserId = room.members.find((id) => id !== user?.user_id);
            console.log('Other User ID:', otherUserId);
            if (otherUserId) {
              const response = await fetchUserDetails(otherUserId);
              console.log('Fetch User Response:', response);
              return response;  // ✅ Return the fetched data
            } else {
              return null;  // Optional: handle missing user
            }
          })
        );
        
        
        
        setReceivers(receiversData);
        console.log(receiversData);
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        toast.error("Failed to load chat rooms");
      }
    };

    fetchChatRoomsAndReceivers();
  }, [isEquipmentChat, user?.user_id]);

  useEffect(() => {
    if (!isEquipmentChat || !product) return;

    const initializeChat = async () => {
      try {
        setIsLoadingMessages(true);
        const createResponse = await axios.post(
          "http://127.0.0.1:8001/api/chat/chat/",
          {
            sender_id: user.user_id,
            receiver_id: product.user,
          },
          { withCredentials: true }
        );
        setChatRoom(createResponse.data);
        
        const messagesResponse = await axios.get(
          `http://127.0.0.1:8001/api/chat/room/${createResponse.data.chatroom}/`,
          { withCredentials: true }
        );
        
        setMessages(messagesResponse.data.messages);
        setOtherUser(await fetchUserDetails(product.user));
      } catch (err) {
        console.error("Error initializing chat:", err);
        toast.error("Failed to initialize chat");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    initializeChat();
  }, [isEquipmentChat, product, user?.user_id]);

  const fetchRoomMessages = async (roomId) => {
    try {
      setIsLoadingMessages(true);
      const response = await axios.get(
        `http://127.0.0.1:8001/api/chat/room/${roomId}/`,
        { withCredentials: true }
      );
      setMessages(response.data.messages);
      
      const otherUserId = response.data.chatroom.members.find(id => id !== user.user_id);
      setOtherUser(await fetchUserDetails(otherUserId));
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const selectChatRoom = async (room) => {
    setSelectedRoom(room);
    await fetchRoomMessages(room.id);
  };

  useEffect(() => {
    const roomId = isEquipmentChat ? chatRoom?.chatroom : selectedRoom?.id;
    if (!roomId) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    const websocket = new WebSocket(`ws://chat-service-7nng.onrender.com/ws/chatroom/${roomId}/${user.user_id}/`);

    websocket.onopen = () => {
      console.log("WebSocket connected:", websocket.url);
      setWs(websocket);
    };

    websocket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === "chat_message") {
          setMessages(prev => {
            const exists = prev.some(msg => 
              msg.id === data.message.id || 
              (msg.temporary && msg.temp_id === data.message.temp_id)
            );
            
            if (!exists) return [...prev, { ...data.message, temporary: false }];
            
            return prev.map(msg => 
              (msg.temporary && msg.temp_id === data.message.temp_id) ? 
              { ...data.message, temporary: false } : msg
            );
          });
        } 
        else if (data.type === "typing_status") {
          if (data.user_id !== user.user_id) {
            setOtherUserTyping(data.typing);
          }
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    websocket.onclose = (event) => {
      if (!event.wasClean) {
        toast.error("Connection closed unexpectedly. Please refresh.");
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error. Please refresh.");
    };

    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatRoom?.chatroom, selectedRoom?.id, isEquipmentChat, user?.user_id]);

  const handleTyping = (isTyping) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    
    setIsTyping(isTyping);
    ws.send(JSON.stringify({
      action: "typing",
      typing: isTyping,
      receiver_id: isEquipmentChat ? product.user : getOtherUserId()
    }));
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        ws.send(JSON.stringify({
          action: "typing",
          typing: false,
          receiver_id: isEquipmentChat ? product.user : getOtherUserId()
        }));
      }, 3000);
    }
  };

  const getOtherUserId = () => {
    if (isEquipmentChat) return product.user;
    if (!selectedRoom) return null;
    return selectedRoom.members.find(id => id !== user.user_id);
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile({
        name: selectedFile.name,
        type: selectedFile.type.includes('image') ? 'image' : 'document',
        url: URL.createObjectURL(selectedFile)
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const tempId = Date.now();
    const tempMessage = {
      temp_id: tempId,
      content: newMessage,
      sender_id: user.user_id,
      receiver_id: isEquipmentChat ? product.user : getOtherUserId(),
      created_at: new Date().toISOString(),
      is_read: false,
      room: isEquipmentChat ? chatRoom.chatroom : selectedRoom.id,
      temporary: true,
      ...(file && { attachment: file })
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    setFile(null);
    handleTyping(false);

    try {
      ws.send(JSON.stringify({
        action: "message",
        content: newMessage,
        receiver_id: isEquipmentChat ? product.user : getOtherUserId(),
        temp_id: tempId,
        ...(file && { attachment: file })
      }));
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg.temp_id !== tempId));
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredChatRooms = chatRooms.filter(room => {
    const otherUserId = room.members.find(id => id !== user.user_id);
    const receiver = receivers.find(r => r.user_id === otherUserId);
    const displayName = receiver ? `${receiver.first_name} ${receiver.last_name}` : `User ${otherUserId?.slice(0, 5)}`;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Chat list */}
      <div className={`${selectedRoom ? 'hidden md:flex md:w-1/3 lg:w-1/4' : 'w-full'} flex flex-col border-r border-gray-200 bg-white`}>
        {/* Header */}
        <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={user?.profile_picture || "https://randomuser.me/api/portraits/men/1.jpg"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover mr-2"
            />
            <h3 className="font-semibold text-lg">Chats</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiMessageSquare className="text-gray-600" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiX className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search Messenger"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-0 text-sm"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <FiMessageSquare className="text-4xl mb-2 text-gray-300" />
              <p className="text-center">No conversations found</p>
            </div>
          ) : (
            filteredChatRooms.map((room, index) => {
              const otherUserId = room.members.find(id => id !== user.user_id);
              const receiver = receivers.find(r => r.user_id === otherUserId);
              const displayName = receiver ? `${receiver.first_name} ${receiver.last_name}` : `User ${otherUserId?.slice(0, 5)}`;
              const lastMessageTime = room.last_message_time ? formatDistanceToNow(new Date(room.last_message_time), { addSuffix: true }) : '';
              
              return (
                <div
                  key={room.id}
                  onClick={() => selectChatRoom(room)}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center ${
                    selectedRoom?.id === room.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <FiUser className="text-gray-500 text-xl" />
                    </div>
                    {room.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 truncate">
                        {displayName}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {room.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right side - Chat area */}
      {selectedRoom || isEquipmentChat ? (
        <div className={`${selectedRoom ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-gray-50`}>
          {/* Chat header */}
          <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setSelectedRoom(null)}
                className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
              >
                <FiChevronLeft className="text-gray-600" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  {otherUser?.profile_picture ? (
                    <img 
                      src={otherUser.profile_picture} 
                      alt={otherUser.username} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-gray-500" />
                  )}
                </div>
                {otherUserTyping && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {otherUser?.first_name || `User ${getOtherUserId()?.slice(0, 5)}`}
                </h3>
                <p className="text-xs text-gray-500">
                  {otherUserTyping ? 'Typing...' : 'Active now'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FiSearch className="text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <BsThreeDotsVertical className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages container */}
          <div 
            className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] bg-opacity-30 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')]"
            style={{ backgroundSize: '412.5px 749.25px' }}
          >
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiMessageSquare className="text-4xl mb-2 text-gray-300" />
                <p className="text-center">
                  {isEquipmentChat 
                    ? "No messages yet. Start the conversation!" 
                    : "No messages in this chat yet"}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender_id === user.user_id;
                const messageTime = format(new Date(message.created_at), 'h:mm a');
                
                return (
                  <div
                    key={message.id || message.temp_id}
                    className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 relative ${
                        isCurrentUser
                          ? 'bg-blue-100 rounded-tr-none'
                          : 'bg-white rounded-tl-none shadow-sm'
                      } ${message.temporary ? 'opacity-80' : ''}`}
                    >
                      {message.attachment && (
                        <div className="mb-2">
                          {message.attachment.type === 'image' ? (
                            <img 
                              src={message.attachment.url} 
                              alt="Attachment" 
                              className="rounded-lg max-w-full h-auto max-h-60 object-cover"
                            />
                          ) : (
                            <div className="border border-gray-200 rounded-lg p-2 flex items-center">
                              <FiPaperclip className="mr-2" />
                              <span className="text-sm truncate">{message.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-gray-800">{message.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                        isCurrentUser ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        <span>{messageTime}</span>
                        {isCurrentUser && (
                          <IoCheckmarkDone className={`${message.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                      {/* Message triangle */}
                      <div className={`absolute top-0 w-3 h-3 ${
                        isCurrentUser 
                          ? 'right-0 bg-blue-100 transform translate-x-1/2 -translate-y-1/2 rotate-45' 
                          : 'left-0 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45'
                      }`}></div>
                    </div>
                  </div>
                );
              })
            )}
            {otherUserTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            {file && (
              <div className="flex items-center justify-between mb-2 bg-gray-100 rounded-lg p-2">
                <div className="flex items-center">
                  <FiPaperclip className="mr-2 text-gray-500" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center">
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-gray-500 hover:text-blue-600"
              >
                <FiPaperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <button type="button" className="p-2 text-gray-500 hover:text-blue-600">
                <BsEmojiSmile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping(e.target.value.length > 0);
                }}
                placeholder="Type a message..."
                className="flex-1 border-0 focus:outline-none focus:ring-0 text-gray-700 px-2 py-2 bg-gray-100 rounded-full mx-2"
              />
              <button
                type={newMessage.trim() || file ? "submit" : "button"}
                className={`p-2 rounded-full ${newMessage.trim() || file ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`}
              >
                {newMessage.trim() || file ? (
                  <RiSendPlaneFill className="w-5 h-5" />
                ) : (
                  <BsMicFill className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md text-center">
            <div className="w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-blue-500 text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Facebook Messenger</h3>
            <p className="text-gray-500 mb-6">
              Select a chat to start messaging or search for people to connect with.
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              New Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;