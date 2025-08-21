// CardGrid.jsx — animated
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"; // motion.dev docs

function CardTab({ item, index, isActive, onSelect, tabId, panelId, focusRef }) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.97 }}
      transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
      ref={focusRef}
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(index)}
      className={[
        "flex h-56 flex-col items-center justify-between rounded-2xl",
        "bg-gradient-to-b from-white/10 to-white/5 border border-white/15",
        "text-white py-4 px-2 space-y-4 focus:outline-none focus:ring-2 focus:ring-white/60",
        isActive ? "ring-2 ring-white/60" : "hover:from-white/20 hover:to-white/10"
      ].join(" ")}
    >
      <div className="flex items-center justify-center rounded-xl">
        {typeof item.icon === "string" ? (
          <img src={item.icon} alt="" className="h-10 w-10 object-contain" />
        ) : (
          item.icon
        )}
      </div>
      <h3 className="text-lg font-semibold text-center">{item.title}</h3>
      <span className="text-sm opacity-90">Learn more…</span>
    </motion.button>
  );
}

// Measure content height so we can animate to/from "auto"
function useMeasuredHeight(depKey) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setHeight(el.scrollHeight);
    update();

    // ResizeObserver reports element size changes (MDN) 
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [depKey]); // re-measure when the active tab changes

  return [ref, height];
}

export default function CardGrid({
  items = [],
  className = "",
  defaultActiveIndex = null, // set to 0 if you want one open by default
}) {
  const [active, setActive] = useState(
    defaultActiveIndex !== null ? defaultActiveIndex : null
  );

  // keyboard navigation (ARIA Tabs pattern) 
  const tabRefs = useRef([]);
  const baseId = useId();
  const ids = useMemo(
    () =>
      items.map((_, i) => ({
        tabId: `${baseId}-tab-${i}`,
        panelId: `${baseId}-panel-${i}`,
      })),
    [items, baseId]
  );

  const onKeyDown = (e, i) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const last = items.length - 1;
    let next = i;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    tabRefs.current[next]?.focus();
  };

  const handleSelect = (i) => {
    // click same card to collapse; remove this if you never want to collapse
    setActive((prev) => (prev === i ? null : i));
  };

  // Measured panel height (changes when active changes or content resizes)
  const [contentRef, contentHeight] = useMeasuredHeight(active);

  return (
    <section className={`w-full ${className}`}>
      <div className="mx-auto max-w-6xl">
        <LayoutGroup>
          {/* Cards grid with FLIP layout animation */}
          <motion.div
            role="tablist"
            aria-label="Services"
            className="grid grid-cols-3 gap-2 py-4"
            layout
            transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
          >
            {items.map((item, i) => (
              <motion.div key={item.id ?? item.title ?? i} onKeyDown={(e) => onKeyDown(e, i)} layout>
                <CardTab
                  item={item}
                  index={i}
                  isActive={active === i}
                  onSelect={handleSelect}
                  tabId={ids[i].tabId}
                  panelId={ids[i].panelId}
                  focusRef={(el) => (tabRefs.current[i] = el)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Single expanding panel below the grid (always mounted wrapper) */}
          <motion.div
            layout
            aria-hidden={active === null}
            className="mt-4 rounded-2xl bg-white/5"
            style={{
              overflow: "hidden",
              height: active === null ? 0 : contentHeight,
              pointerEvents: active === null ? "none" : "auto",
            }}
            transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence initial={false} mode="wait">
              {active !== null && items[active] && (
                <motion.div
                  key={active}
                  ref={contentRef}
                  initial={{ opacity: 0, y: 8, clipPath: "inset(0 0 100% 0)" }}
                  animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                  exit={{ opacity: 0, y: 8, clipPath: "inset(0 0 100% 0)" }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 text-white"
                  role="tabpanel"
                  id={ids[active].panelId}
                  aria-labelledby={ids[active].tabId}
                >
                  {/* Title + paragraph */}
                  <h4 className="text-xl font-semibold mb-2">
                    {items[active].content?.title}
                  </h4>
                  <p className="opacity-90">{items[active].content?.paragraph}</p>

                  {/* Row of 2 boxes for testing */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                      {items[active].content?.boxLeft ?? "Left test box"}
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                      {items[active].content?.boxRight ?? "Right test box"}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
