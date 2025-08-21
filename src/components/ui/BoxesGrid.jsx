// BoxesGrid.jsx — 2-column grid (N items). Clicking a card shows a paragraph right under its row.
import React, { useId, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

function CardTabSimple({ label, index, isActive, onSelect, tabId, panelId, focusRef }) {
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
        "flex w-full h-30 items-center justify-center rounded-2xl",
        "bg-gradient-to-b from-white/10 to-white/5 border border-white/15",
        "text-white px-3 text-center focus:outline-none focus:ring-2 focus:ring-white/60",
        isActive ? "ring-1 ring-white/60" : "hover:from-white/20 hover:to-white/10",
      ].join(" ")}
    >
      <p className="text-sm font-semibold leading-tight line-clamp-2">{label}</p>
    </motion.button>
  );
}

/**
 * Simple 2-column grid. Each card shows a short text label.
 * When a card is selected, a single paragraph expands UNDER THE SAME ROW.
 *
 * Props:
 * - items: Array<{ id?: string, label?: string, name?: string, paragraph?: string, subtitle?: string } | string>
 *   - Strings are treated as { label: string }
 *   - `name` maps to card text, `subtitle` maps to the expanded paragraph.
 */
export default function BoxesGrid({
  items = [
    { label: "First card", paragraph: "This is the paragraph for the first card." },
    { label: "Second card", paragraph: "This is the paragraph for the second card." },
    { label: "Third card", paragraph: "This is the paragraph for the third card." },
  ],
}) {
  // Normalize input; support both {label, paragraph} and {name, subtitle}. No slicing: render all items.
  const normalized = (items || []).map((i) => {
    if (typeof i === "string") return { label: i, paragraph: "" };
    const label = i.label ?? i.name ?? "";
    const paragraph = i.paragraph ?? i.subtitle ?? "";
    return { ...i, label, paragraph };
  });

  const [active, setActive] = useState(0);
  const listId = useId();

  // Refs + ids for a11y and focus management
  const tabRefs = useMemo(() => ({ current: [] }), []);
  const ids = useMemo(
    () =>
      normalized.map((_, i) => ({
        tabId: `${listId}-tab-${i}`,
        panelId: `${listId}-panel-${i}`,
      })),
    [normalized, listId]
  );

  function onKeyDown(e, i) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const last = normalized.length - 1;
    let next = i;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    setActive(next);
    const btn = tabRefs.current[next];
    if (btn && typeof btn.focus === "function") btn.focus();
  }

  if (normalized.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mx-auto w-full">
        <LayoutGroup>
          <motion.div layout>
            {/* 2-column card grid that can host a full-width panel inline */}
            <motion.div
              role="tablist"
              aria-label="Options"
              className="grid grid-cols-2 gap-2 py-4 justify-items-stretch"
              layout
              transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
            >
              {normalized.map((item, i) => {
                const isEndOfRow = i % 2 === 1 || i === normalized.length - 1;
                const rowStart = i - (i % 2);
                const rowEnd = Math.min(rowStart + 1, normalized.length - 1);
                const isActiveInThisRow = active >= rowStart && active <= rowEnd;

                return (
                  <React.Fragment key={item.id ?? item.label ?? item.name ?? i}>
                    {/* Card */}
                    <motion.div onKeyDown={(e) => onKeyDown(e, i)} layout className="min-w-0 w-full">
                      <CardTabSimple
                        label={item.label}
                        index={i}
                        isActive={active === i}
                        onSelect={setActive}
                        tabId={ids[i].tabId}
                        panelId={ids[i].panelId}
                        focusRef={(el) => (tabRefs.current[i] = el)}
                      />
                    </motion.div>

                    {/* Inline expanded paragraph panel below this row */}
                    {isEndOfRow && isActiveInThisRow && (
                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={`panel-${active}`}
                          role="tabpanel"
                          id={ids[active].panelId}
                          aria-labelledby={ids[active].tabId}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden col-span-2"
                        >
                          <div className="rounded-2xl px-2 py-4 text-center text-white">
                            <p className="text-sm/6 text-white/80">{normalized[active].paragraph || ""}</p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </React.Fragment>
                );
              })}
            </motion.div>
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
