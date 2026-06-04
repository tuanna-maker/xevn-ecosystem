/** CSS bổ sung cho HTML SRS gửi khách (flow-box, danh sách đánh số, bảng). */
export const SRS_DELIVERY_STYLES = `
/* --- SRS delivery components (BRD_SRS_WRITING_STANDARDS §4.3) --- */
.content-area .stat-row { width: 100%; margin: 14px 0 18px; border-collapse: collapse; }
.content-area .stat-row th,
.content-area .stat-row td { padding: 8px 12px; border: 1px solid var(--line, #dde6f4); }
.content-area .flow-box,
.content-area ol.srs-steps {
  margin: 12px 0 16px;
  padding: 12px 16px 12px 2.25em;
  background: #f8fbff;
  border: 1px solid var(--line, #dde6f4);
  border-radius: 8px;
  list-style: decimal;
}
.content-area .flow-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 8px 0;
  line-height: 1.55;
}
.content-area .flow-step .step-num {
  flex: 0 0 1.85em;
  min-width: 1.85em;
  text-align: center;
  font-weight: 700;
  color: var(--cyan, #0ab4d8);
  line-height: 1.55;
}
.content-area .flow-step > span:last-child { flex: 1; min-width: 0; }
.content-area ol.srs-steps > li {
  margin: 6px 0;
  padding-left: 0.35em;
  line-height: 1.55;
}
.content-area ol:not(.srs-steps) {
  margin: 10px 0 14px;
  padding-left: 2em;
}
.content-area ol:not(.srs-steps) > li {
  margin: 5px 0;
  padding-left: 0.35em;
  line-height: 1.55;
}
.content-area ul { margin: 10px 0 14px; padding-left: 1.5em; }
.content-area ul > li { margin: 4px 0; line-height: 1.5; }
.content-area .two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 14px 0;
}
.content-area .col-box {
  padding: 12px 14px;
  border: 1px solid var(--line, #dde6f4);
  border-radius: 8px;
  background: #fafcff;
}
.content-area .callout {
  margin: 14px 0;
  padding: 12px 14px;
  border-left: 4px solid var(--cyan, #0ab4d8);
  background: #f0f9fc;
  border-radius: 0 8px 8px 0;
}
.content-area .callout-warn {
  border-left-color: #e6a817;
  background: #fffbf0;
}
.content-area .architecture-figure {
  margin: 16px 0;
  text-align: center;
}
.content-area .architecture-figure img {
  max-width: 100%;
  height: auto;
}
.content-area .architecture-figure figcaption {
  font-size: 0.9em;
  color: var(--sub, #5a7090);
  margin-top: 8px;
}
@media (max-width: 900px) {
  .content-area .two-col { grid-template-columns: 1fr; }
}
`;
