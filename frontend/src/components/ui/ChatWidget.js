import React, { useEffect, useRef, useState } from "react";
import { FaComments, FaPaperPlane, FaMicrophone, FaPaperclip, FaUserCircle } from "react-icons/fa";
import { IoClose, IoEllipsisHorizontal } from "react-icons/io5";
import { MdOutlineThumbUp } from "react-icons/md";
import { RiWechatLine } from "react-icons/ri";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const DEFAULT_BUTTON_SIZE = 48;
const PANEL_W = 400;
const PANEL_H = 480;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  // position stored as {x, y} = top-left coordinates for the button
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem("chatWidgetPos");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return { x: window.innerWidth - DEFAULT_BUTTON_SIZE - 20, y: window.innerHeight - DEFAULT_BUTTON_SIZE - 20 };
  });

  const [dragging, setDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const dragMetaRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, moved: 0 });
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // dummy message
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hello! How can I help you today?", time: "7:20" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("chatWidgetPos", JSON.stringify(pos));
    } catch (e) {}
  }, [pos]);

  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: clamp(p.x, 8, Math.max(8, window.innerWidth - DEFAULT_BUTTON_SIZE - 8)),
        y: clamp(p.y, 8, Math.max(8, window.innerHeight - DEFAULT_BUTTON_SIZE - 8)),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragMetaRef.current) return;
      if (!dragging) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const nx = clientX - dragMetaRef.current.startX + dragMetaRef.current.origX;
      const ny = clientY - dragMetaRef.current.startY + dragMetaRef.current.origY;

      const clampedX = clamp(nx, 8, Math.max(8, window.innerWidth - DEFAULT_BUTTON_SIZE - 8));
      const clampedY = clamp(ny, 8, Math.max(8, window.innerHeight - DEFAULT_BUTTON_SIZE - 8));

      setPos({ x: clampedX, y: clampedY });

      if (Math.abs(clientX - dragMetaRef.current.startX) > 3 || Math.abs(clientY - dragMetaRef.current.startY) > 3) {
        setWasDragged(true);
        }
    };

    const onUp = () => {
      if (dragging) {
        setDragging(false);
        dragMetaRef.current.moved = 0;
      }
    };

    if (dragging) {
      window.addEventListener("mousemove", onMove, { passive: false });
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]);

  const onButtonPointerDown = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragMetaRef.current.startX = clientX;
    dragMetaRef.current.startY = clientY;
    dragMetaRef.current.origX = pos.x;
    dragMetaRef.current.origY = pos.y;
    dragMetaRef.current.prevX = clientX;
    dragMetaRef.current.moved = 0;
    setDragging(true);
  };

  const onButtonClick = () => {
    if (wasDragged) {
      setWasDragged(false);
      return;
    }
    setIsOpen((s) => !s);
  };

  const computePanelStyle = () => {
    const pad = 12;
    const panelW = PANEL_W;
    const panelH = PANEL_H;
    let left = pos.x - (panelW - DEFAULT_BUTTON_SIZE) + 12;
    let top = pos.y - panelH - 12;

    if (top < 8) {
      top = pos.y + DEFAULT_BUTTON_SIZE + 12;
    }

    left = clamp(left, 8, Math.max(8, window.innerWidth - panelW - 8));
    top = clamp(top, 8, Math.max(8, window.innerHeight - panelH - 8));

    return { left, top };
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const t = new Date();
    const hhmm = `${t.getHours()}:${String(t.getMinutes()).padStart(2, "0")}`;
    setMessages((m) => [...m, { id: Date.now(), from: "user", text: text.trim(), time: hhmm }]);
    setInput("");
    
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: "Thanks, we received your message. We'll get back shortly.", time: hhmm },
      ]);
    }, 700);
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const renderBubble = (msg) => {
    const isBot = msg.from === "bot";
    return (
      <div key={msg.id} className={`flex ${isBot ? "items-end" : "items-end"} gap-1 mb-4`}>
        {isBot && (
          <div className="w-8 h-8 rounded-full bg-[#1847A6] flex items-center justify-center text-white text-sm shadow">
            {/* bot avatar */}
            <FaComments className="w-4 h-4" />
          </div>
        )}
        <div className={`${isBot ? "mr-auto" : "ml-auto"} max-w-[78%]`}>
          <div
            className={`px-4 py-3 rounded-2xl text-xs leading-snug ${
              isBot ? "bg-[#4173D9] text-white rounded-bl-[2px]" : "bg-[#B2D7CA] text-[#444444] rounded-br-[2px]"
            }`}
          >
            {msg.text}
          </div>
          <div className={`text-[11px] mt-1 ml-2 text-[#888888]`}>{msg.time}</div>
        </div>
        {!isBot && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-t from-[#3B6255] to-[#578C7A] flex items-center justify-center text-white text-sm shadow">
            <FaUserCircle className="text-xl text-white" />
          </div>
        )}
      </div>
    );
  };

  const panelStyle = isOpen ? computePanelStyle() : { left: pos.x, top: pos.y };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* chat button */}
      <div
        ref={btnRef}
        onMouseDown={onButtonPointerDown}
        onTouchStart={onButtonPointerDown}
        onClick={onButtonClick}
        role="button"
        aria-label="Open support chat"
        title="Support chat"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: DEFAULT_BUTTON_SIZE,
          height: DEFAULT_BUTTON_SIZE,
          zIndex: 1200,
          cursor: dragging ? "grabbing" : "pointer",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: "100%",
            height: "100%",
            background: "#1847A6",
            borderRadius: "20px",
            borderBottomLeftRadius: "2px",
            border: "1px",
            borderColor: "#351580",
            boxShadow: "5px 5px 20px 0px rgba(3, 47, 88, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            transform: dragging ? "scale(0.98)" : "none",
          }}
        >
          <RiWechatLine className="w-6 h-6" />
        </div>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            width: PANEL_W,
            height: PANEL_H,
            resize: "both",
            zIndex: 1300,
            left: panelStyle.left,
            top: panelStyle.top,
            boxShadow: "0 10px 30px rgba(4,20,12,0.25)",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#F8F9FA",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-move"
            style={{
              background: "linear-gradient(360deg, #223931 0%, #578C7A 100%)",
              color: "white",
              alignItems: "center",
              boxShadow: "0px 24px 34px 0px rgba(174, 10, 10, 0.45)",
            }}
            onMouseDown={(e) => {
                const shiftX = e.clientX - panelRef.current.getBoundingClientRect().left;
                const shiftY = e.clientY - panelRef.current.getBoundingClientRect().top;

                function moveAt(pageX, pageY) {
                    panelRef.current.style.left = pageX - shiftX + "px";
                    panelRef.current.style.top = pageY - shiftY + "px";
                }

                function onMouseMove(ev) {
                    moveAt(ev.pageX, ev.pageY);
                }

                document.addEventListener("mousemove", onMouseMove);
                document.onmouseup = () => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.onmouseup = null;
                };
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <RiWechatLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold">Help</div>
                <div className="flex items-center gap-1 text-xs text-[#43EE7D] opacity-80">
                    <span className="w-2 h-2 rounded-full bg-[#43EE7D]"></span>
                    Online
                </div>

              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Close chat"
              >
                <IoClose className="text-white w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: "#fafafa" }}>
            <div className="space-y-3">
              {messages.map((m) => renderBubble(m))}
            </div>
          </div>

          {/* Quick replies */}
          <div className="px-4 py-1 bg-white shadow-[0px_-4px_16px_0px_#00000014]">
            <div className="flex gap-2 overflow-x-auto">
              {["How do I create a new shipment?", "How do I assign loads to drivers?"].map(
                (c, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(c)}
                    className="flex-shrink-0 px-4 py-2 mb-1 mt-2 bg-[#F3F5F6] rounded-full text-xs text-[#444444] shadow-[0px_1px_0px_0px_#0000001F] hover:bg-gray-200"
                  >
                    {c}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="px-4 py-1 bg-white flex items-center justify-center gap-1">
            <div className="relative flex-1 mb-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message here..."
                className="w-full resize-none h-10 pl-3 pr-10 py-2 rounded-xl bg-[#B2D7CA3B] placeholder:text-[#9AAFA4] text-[#444444] text-xs focus:outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                className="absolute right-2 top-5 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[#578C7A]"
                aria-label="Send"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={() => {
                  // add attachment
                }}
                className="w-10 h-10 rounded-full bg-[#B2D7CA3B] flex items-center justify-center"
                aria-label="Attach"
              >
                <FaPaperclip className="w-4 h-4 text-[#578C7A]" />
              </button>
              <button
                onClick={() => {
                  // add voice
                }}
                className="w-10 h-10 rounded-full bg-[#B2D7CA3B] flex items-center justify-center"
                aria-label="Microphone"
              >
                <FaMicrophone className="w-4 h-4 text-[#578C7A]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;