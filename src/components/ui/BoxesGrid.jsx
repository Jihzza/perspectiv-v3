// BoxesGrid.jsx — 2-column grid (N items). Clicking a card shows a paragraph right under its row.
import React, { useId, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

function CardTabSimple({ label, index, isActive, isTabbable, onSelect, tabId, panelId, focusRef }) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.97 }}
      transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
      ref={focusRef}
      role="button"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isTabbable ? 0 : -1}
      onClick={() => onSelect(index)}
      className={[
        "flex w-full h-30 items-center justify-center rounded-2xl",
        "bg-gradient-to-b from-white/10 to-white/5 border border-white/15",
        "text-white px-3 text-center focus:outline-none focus:ring-2 focus:ring-white/40",
        isActive ? "ring-1 ring-white/40" : "hover:from-white/20 hover:to-white/10",
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
    { label: "AI Strategy & Roadmap", paragraph: "A phased plan tailored to your goals—quick wins first, long-term bets after." },
    { label: "Tool & Platform Guidance", paragraph: "Recommendations based on your stack, team skills, and budget." },
    { label: "Data Readiness Assessment", paragraph: "Snapshot of data quality, access, and governance with practical steps." },
    { label: "Use Case Discovery", paragraph: "Identify high-ROI use cases and risks with impact estimates." },
    { label: "Security & Compliance Advisory", paragraph: "Ensure privacy, safety, and compliance in your AI initiatives." },
    { label: "Model Evaluation & Analysis", paragraph: "Test, compare, and monitor model performance and drift." },
    { label: "Change Management", paragraph: "Train teams and build processes to adopt AI successfully." },
  ],
}) {
  // Normalize input; support both {label, paragraph} and {name, subtitle}. No slicing: render all items.
  const normalized = useMemo(
    () =>
      (items || []).map((i) => {
        if (typeof i === "string") return { label: i, paragraph: "" };
        const label = i.label ?? i.name ?? "";
        const paragraph = i.paragraph ?? i.subtitle ?? "";
        return { ...i, label, paragraph };
      }),
    [items]
  );

  const [active, setActive] = useState(null);
  const listId = useId();

  // Toggle selection on click
  const handleSelect = (index) => {
    setActive((prev) => (prev === index ? null : index));
  };

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

  // Keyboard nav: Left/Right/Home/End + Up/Down for a 2-column grid
  function onKeyDown(e, i) {
    const last = normalized.length - 1;
    const colCount = 2;
    const col = i % colCount;
    const row = Math.floor(i / colCount);

    let next = i;
    switch (e.key) {
      case "ArrowRight":
        next = i === last ? 0 : i + 1;
        break;
      case "ArrowLeft":
        next = i === 0 ? last : i - 1;
        break;
      case "ArrowDown": {
        const candidate = (row + 1) * colCount + col;
        next = candidate <= last ? candidate : last;
        break;
      }
      case "ArrowUp": {
        const candidate = (row - 1) * colCount + col;
        next = candidate >= 0 ? candidate : 0;
        break;
      }
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActive(next);
    const btn = tabRefs.current[next];
    if (btn && typeof btn.focus === "function") btn.focus();
  }

  if (normalized.length === 0) return null;

  // Build rows of 2
  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < normalized.length; i += 2) {
      r.push(normalized.slice(i, i + 2));
    }
    return r;
  }, [normalized]);

  // Widow detection: if total is odd, the last index is a single-item last row.
  const isWidow = normalized.length % 2 === 1;
  const widowIndex = isWidow ? normalized.length - 1 : -1;

  const activeRow = active === null ? -1 : Math.floor(active / 2);

  return (
    <section className="w-full">
      <div className="mx-auto w-full">
        <LayoutGroup>
          <motion.div layout>
            {/* 2-column card grid with a row-scoped panel */}
            <div
              role="tablist"
              aria-label="Options"
              className="grid grid-cols-2 gap-2 py-4 justify-items-stretch"
            >
              {rows.map((row, rIdx) => (
                <React.Fragment key={`row-${rIdx}`}>
                  {/* cards for this row */}
                  {row.map((item, i) => {
                    const index = rIdx * 2 + i;
                    const isActive = active === index;
                    const isTabbable = active === null ? index === 0 : isActive;

                    const itemWrapperClass = [
                         "min-w-0",
                         index === widowIndex
                           ? "col-span-2 justify-self-center w- max-w-md"
                           : "w-full",
                       ].join(" ");

                    return (
                      <motion.div
                        key={item.id ?? item.label ?? item.name ?? index}
                        onKeyDown={(e) => onKeyDown(e, index)}
                        layout
                        className={itemWrapperClass}
                      >
                        <CardTabSimple
                          label={item.label}
                          index={index}
                          isActive={isActive}
                          isTabbable={isTabbable}
                          onSelect={handleSelect}
                          tabId={ids[index].tabId}
                          panelId={ids[index].panelId}
                          focusRef={(el) => (tabRefs.current[index] = el)}
                        />
                      </motion.div>
                    );
                  })}

                  {/* row-scoped expander right under this row */}
                  <AnimatePresence initial={false}>
                    {active !== null && activeRow === rIdx && normalized[active] && (
                      <motion.div
                        key={`panel-row-${rIdx}`}
                        role="region"
                        id={ids[active].panelId}
                        aria-labelledby={ids[active].tabId}
                        className="overflow-hidden col-span-2"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="px-2 py-4 text-center text-white">
                          <p className="text-sm/6 text-white">
                            {normalized[active].paragraph || ""}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
