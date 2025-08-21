// BoxesGrid.jsx
import React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

/**
 * Props (unchanged):
 * - items?: Array<any>
 * - rows?:  Array<Array<any>>
 * - renderItem?: (item, index) => React.ReactNode
 * - className?: string
 * - cardClassName?: string
 */

// Measure the inner content's height so we can animate a numeric height smoothly.
function useMeasuredHeight(deps = []) {
  const ref = React.useRef(null);
  const [h, setH] = React.useState(0);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setH(el.scrollHeight);
    update();

    // Track dynamic changes (responsive wraps, fonts, etc.)
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, deps);

  return [ref, h];
}

export default function BoxesGrid({
  items = [],
  rows,
  renderItem,
  className = "",
  cardClassName = "",
}) {
  const [expandedId, setExpandedId] = React.useState(null);

  // Build 2-up rows if not provided
  const effectiveRows = React.useMemo(() => {
    if (Array.isArray(rows) && rows.length) return rows;
    const out = [];
    for (let i = 0; i < items.length; i += 2) out.push(items.slice(i, i + 2));
    return out;
  }, [rows, items]);

  // Stable id getter: item.id if present, otherwise fall back to list index
  const getId = React.useCallback((item, fallbackIndex) => {
    return item?.id ?? fallbackIndex;
  }, []);

  // Read reveal text from common keys so you don't have to rename your data
  const getContent = React.useCallback((item) => {
    const keys = ["subtitle", "description", "details", "body", "text", "content"];
    for (const k of keys) if (item && item[k]) return item[k];
    return null;
  }, []);

  const onToggle = (id) => setExpandedId((cur) => (cur === id ? null : id));

  // One card cell
  const Cell = ({ item, globalIndex }) => {
    const id = getId(item, globalIndex);
    const isOpen = expandedId === id;

    return (
      <motion.div layout>
        <motion.div
          layout
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={() => onToggle(id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle(id)}
          whileTap={{ scale: 0.97 }}
          className={cardClassName}     // keep your exact visuals
          style={{ cursor: "pointer" }}
        >
          {typeof renderItem === "function" ? (
            renderItem(item, globalIndex)
          ) : (
            <div className="text-center h-25 flex items-center justify-between rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border-1 border-white/15 text-white p-4">
              {item?.name ?? `Item ${globalIndex + 1}`}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // Full-width expander shown right after the row containing the open card
  // BoxesGrid.jsx  — replace your RowExpander with this
const RowExpander = ({ item, gid }) => {
  const content = item ? getContent(item) : null;
  const isOpen = Boolean(item && content);

  // measure the inner content once; cached value is used for exit
  const [contentRef, contentHeight] = useMeasuredHeight([content, gid, isOpen]);

  return (
    // stable wrapper; positioned so layout+exit math is consistent in grid
    <div className="col-span-2" style={{ gridColumn: "1 / -1", position: "relative" }}>
      {/* always-mounted height tweener => identical open/close */}
      <motion.div
        layout
        initial={false}
        animate={{ height: isOpen ? contentHeight : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: "hidden", willChange: "height, opacity", pointerEvents: isOpen ? "auto" : "none" }}
      >
        <AnimatePresence initial={false} mode="sync">
          {isOpen && (
            <motion.div
              key={`expander-inner-${gid}`}
              ref={contentRef}
              initial={{ opacity: 0, y: 8, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, y: 8, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="p-2 text-white leading-relaxed text-center"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

  return (
    <LayoutGroup id="boxes-grid">
      <motion.section layout className={className}>
        {/* Layout animation on the grid so rows after the expander glide down */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
          className="grid grid-cols-2 gap-2"
        >
          {effectiveRows.map((row, rowIndex) => {
            // Find the open item in this row and compute the SAME gid used on click
            let openItem = null;
            let openGid = null;

            row.forEach((it, i) => {
              const gid = getId(it, rowIndex * 2 + i);
              if (gid === expandedId) {
                openItem = it;
                openGid = gid;
              }
            });

            return (
              <React.Fragment key={`row-${rowIndex}`}>
                {row.map((item, i) => (
                  <Cell
                    key={getId(item, rowIndex * 2 + i)}
                    item={item}
                    globalIndex={rowIndex * 2 + i}
                  />
                ))}
                {/* Expander spans the full row, pushing all following content down */}
                <RowExpander item={openItem} gid={openGid} />
              </React.Fragment>
            );
          })}
        </motion.div>
      </motion.section>
    </LayoutGroup>
  );
}
