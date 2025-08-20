// src/pages/HomePage.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, cubicBezier } from "framer-motion";
import * as htmlToImage from "html-to-image";

import HeroSection from "../components/Hero/HeroSection";
import ChatbotSection from "../components/Chatbot/ChatbotSection";
import ServicesDescriptionSection from "../components/Services/ServicesDescriptionSection";
import DashboardSection from "../components/Dashboard/DashboardSection";
import { supabase } from "../lib/supabaseClient";

import SnapshotSuctionOverlay from "../components/Effects/SnapshotSuctionOverlay";

export default function HomePage() {
  const chatbotRef = useRef(null);

  // --- Auth (same as before) ---
  const [userId, setUserId] = useState(undefined);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUserId(data?.user?.id ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);
  useEffect(() => {
    try {
      if (userId) localStorage.setItem("user_id", userId);
      else localStorage.removeItem("user_id");
    } catch { }
  }, [userId]);

  // --- Reduced motion ---
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(!!mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // --- Measure base height for collapse/expand ---
  const [baseH, setBaseH] = useState(560);
  useLayoutEffect(() => {
    const el = chatbotRef.current;
    if (el) {
      const h = el.offsetHeight;
      if (h) setBaseH(h);
    }
  }, []);

  // --- State & overlay control ---
  const [minimized, setMinimized] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [snapUrl, setSnapUrl] = useState(null);
  const [overlayMode, setOverlayMode] = useState("minimize");
  const [showOverlay, setShowOverlay] = useState(false);

  // Early trigger + hysteresis
  const THRESHOLD_DOWN = 60;  // trigger earlier
  const THRESHOLD_UP = 24;  // restore sooner on scroll-up

  // Capture helper: PNG snapshot of the chat section
  async function captureChatSnapshot() {
    const node = chatbotRef.current;
    if (!node) return null;
    try {
      // Lower pixelRatio for perf; cacheBust helps with CORS images
      return await htmlToImage.toPng(node, {
        pixelRatio: Math.min(1.2, window.devicePixelRatio || 1),
        cacheBust: true,
        backgroundColor: "transparent",
        // Optional: filter out elements you don't want in the snapshot
        // filter: (n) => !(n.dataset && n.dataset.noScreenshot === "true"),
      });
    } catch (e) {
      console.warn("Snapshot failed, proceeding without overlay:", e);
      return null;
    }
  }

  // Scroll direction + thresholds
  const { scrollY } = useScroll();
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", async (latest) => {
    if (reduceMotion) return;
    if (animating) { lastY.current = latest; return; }

    const prev = lastY.current;
    const dir = latest > prev ? "down" : "up";
    lastY.current = latest;

    // MINIMIZE — earlier
    if (!minimized && dir === "down" && latest >= THRESHOLD_DOWN) {
      setAnimating(true);
      // 1) capture snapshot BEFORE collapsing
      const dataUrl = await captureChatSnapshot();
      if (dataUrl) setSnapUrl(dataUrl);
      // 2) start overlay
      setOverlayMode("minimize");
      setShowOverlay(!!dataUrl); // show overlay only if we have a snapshot
      // 3) collapse the live section (page content moves up)
      setMinimized(true);
      // If no snapshot, we still finish instantly (collapse alone)
      if (!dataUrl) setAnimating(false);
    }

    // RESTORE — as user scrolls back up
    if (minimized && dir === "up" && latest <= THRESHOLD_UP) {
      setAnimating(true);
      // Use cached snapshot for reverse flight (avoid re-capturing)
      if (snapUrl) {
        setOverlayMode("restore");
        setShowOverlay(true);
      }
      // Expand live section underneath
      setMinimized(false);
      if (!snapUrl) setAnimating(false);
    }
  });

  // Wrapper animation props (collapses when minimized)
  const fluentAccelerate = cubicBezier(1, 0, 1, 1);
  const wrapperAnimate = minimized
    ? { maxHeight: 0, opacity: 0, marginTop: -16 }
    : { maxHeight: baseH, opacity: 1, marginTop: 0 };

  return (
    <main className="min-h-screen">
      <HeroSection />

      {/* Collapsible Chat wrapper */}
      <motion.div
        ref={chatbotRef}
        className="overflow-hidden"
        initial={false}
        animate={reduceMotion ? { maxHeight: baseH, opacity: 1, marginTop: 0 } : wrapperAnimate}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: fluentAccelerate }}
        style={{ willChange: "max-height, opacity, margin-top" }}
      >

        <ChatbotSection
          webhookUrl={import.meta.env.VITE_N8N_DECISION_WEBHOOK_URL}
          welcomeWebhookUrl={import.meta.env.VITE_N8N_WELCOME_WEBHOOK_URL}
          userId={userId}
        />
      </motion.div>

      {/* Snapshot suction overlay */}
      {showOverlay && snapUrl && (
        <SnapshotSuctionOverlay
          imgSrc={snapUrl}
          anchorRef={chatbotRef}
          targetSelector="#perspectiv-nav-logo"
          mode={overlayMode}
          duration={reduceMotion ? 0 : 0.5}   // no motion when reduced
          endOpacity={reduceMotion ? 1 : 0.88}
          onComplete={() => { setShowOverlay(false); setAnimating(false); }}
        />
      )}

      <ServicesDescriptionSection />
      <DashboardSection />
    </main>
  );
}
