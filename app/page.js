"use client";
import { useMemo, useState } from "react";
import { layout, occupancy, dateList, purposeColors } from "../lib/data";

const floors = ["7/F", "6/F", "5/F", "4/F", "3/F", "2/F", "1/F", "G/F"];
const cols = Array.from({ length: 11 }, (_, i) => i + 1);
const allRooms = Object.entries(layout).flatMap(([f, arr]) =>
  arr.map((r) => ({ ...r, floor: f }))
);

export default function Home() {
  const [dateKey, setDateKey] = useState(dateList[0]);
  const [sel, setSel] = useState(null);
  const day = occupancy[dateKey];
  const occ = day.rooms;

  const freeRooms = allRooms.filter((r) => !occ[r.code]);
  const occRooms = allRooms.filter((r) => occ[r.code]);

  // 全期都沒被使用的課室（隨時可施工）
  const alwaysFreeCodes = useMemo(() => {
    const usedEver = new Set();
    dateList.forEach((d) =>
      Object.keys(occupancy[d].rooms).forEach((c) => usedEver.add(c))
    );
    const codes = new Set();
    allRooms.forEach(r => {
      if (!usedEver.has(r.code)) codes.add(r.code);
    });
    return codes;
  }, []);

  const alwaysFreeRooms = allRooms.filter(r => alwaysFreeCodes.has(r.code));

  return (
    <main>
      <header className="top">
        <h1>電子白板施工避開日子｜2025-2026 中學</h1>
        <p>綠色 = 空置（可施工）　彩色 = 已被使用（須避開）</p>
      </header>

      {/* 日期選擇 */}
      <div className="dates">
        {dateList.map((d) => (
          <button
            key={d}
            className={d === dateKey ? "date active" : "date"}
            onClick={() => { setDateKey(d); setSel(null); }}
          >
            {occupancy[d].label}
            <span>{Object.keys(occupancy[d].rooms).length} 間被用</span>
          </button>
        ))}
      </div>

      {/* 統計 */}
      <div className="stats">
        <div className="stat s-used"><b>{occRooms.length}</b>被使用課室</div>
        <div className="stat s-free"><b>{freeRooms.length}</b>可施工課室</div>
        <div className="stat s-any"><b>{alwaysFreeRooms.length}</b>全期隨時可施工</div>
      </div>

      <div className="wrap">
        {/* 平面圖 */}
        <div className="planbox">
          <div className="colhead">
            <div className="flabel"></div>
            {cols.map((c) => (
              <div key={c} className="chead">{String(c).padStart(2, "0")}</div>
            ))}
          </div>
          {floors.map((f) => (
            <div key={f} className="frow">
              <div className="flabel">{f}</div>
              {cols.map((c) => {
                const room = (layout[f] || []).find((r) => r.col === c);
                if (!room) return <div key={c} className="cell empty" />;
                const use = occ[room.code];
                const isAlwaysFree = alwaysFreeCodes.has(room.code);
                const bg = use ? purposeColors[use.p] || "#ef4444" : null;
                
                let cellClass = "cell ";
                if (use) cellClass += "used";
                else if (isAlwaysFree) cellClass += "free always-free";
                else cellClass += "free";

                return (
                  <div
                    key={c}
                    className={cellClass}
                    style={use ? { background: bg } : {}}
                    onClick={() => setSel({ ...room, use, isAlwaysFree })}
                    title={room.code}
                  >
                    <div className="rname">{room.name}</div>
                    <div className="rcode">{room.code}</div>
                    {use ? (
                      <div className="rinfo">{use.t}<br/>{use.p}</div>
                    ) : (
                      <div className="rok">{isAlwaysFree ? "優先施工 ★" : "可施工 ✓"}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* 圖例 */}
          <div className="legend">
            <span className="lg" style={{ background: "#dcfce7", color:"#166534", border: "1px solid #86efac" }}>空置 / 可施工</span>
            <span className="lg" style={{ background: "#bbf7d0", color:"#166534", border: "2px solid #22c55e", fontWeight: "bold" }}>★ 優先 / 全期空置</span>
            {Object.entries(purposeColors).map(([p, c]) => (
              <span key={p} className="lg" style={{ background: c }}>{p}</span>
            ))}
          </div>
        </div>

        {/* 側欄 */}
        <aside className="side">
          {sel && (
            <div className="detail">
              <h3>{sel.name} <small>({sel.code})</small></h3>
              <p>{sel.floor}</p>
              {sel.use ? (
                <>
                  <p><b>使用人：</b>{sel.use.t}</p>
                  <p><b>性質：</b>{sel.use.p}</p>
                  <p className="warn">⚠ 此日請勿施工</p>
                </>
              ) : (
                <p className="okmsg">
                  {sel.isAlwaysFree ? "★ 全期空置，建議優先施工" : "✓ 此日空置，可安排施工"}
                </p>
              )}
            </div>
          )}

          <h3>本日可施工課室（{freeRooms.length}）</h3>
          <ul className="list free-list">
            {freeRooms.map((r) => (
              <li key={r.code}>
                {r.floor}｜{r.name}
                {alwaysFreeCodes.has(r.code) && <b style={{color:'#22c55e', marginLeft:'4px'}}>★</b>}
                <span>{r.code}</span>
              </li>
            ))}
          </ul>

          <h3>全期隨時可施工（{alwaysFreeRooms.length}）</h3>
          <ul className="list any-list">
            {alwaysFreeRooms.map((r) => (
              <li key={r.code}>{r.floor}｜{r.name}<span>{r.code}</span></li>
            ))}
          </ul>
        </aside>
      </div>
      <footer>資料來源：電子白版施工避開日子_2025-2026.xlsx｜房號 = S+樓層+課室圖欄號</footer>
    </main>
  );
}
