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

  // Helper to check if a room should be BLOCKED (Reserved)
  const isReserved = (floor, date) => {
    const d = parseInt(date.split("-")[2]); // Extract day from YYYY-MM-DD
    
    // 1. 20/7-22/7 7樓
    if (floor === "7/F" && d >= 20 && d <= 22) return true;
    // 2. 20/7-23/7 3樓
    if (floor === "3/F" && d >= 20 && d <= 23) return true;
    // 3. 20/7-24/7 2樓
    if (floor === "2/F" && d >= 20 && d <= 24) return true;
    // 4. 20/7-30/7 6樓
    if (floor === "6/F" && d >= 20 && d <= 30) return true;
    
    return false;
  };

  const processedRooms = useMemo(() => {
    return allRooms.map(r => {
      const use = occ[r.code];
      // If there is an actual use record, it's NOT "reserved" (actual use takes priority)
      const reserved = !use && isReserved(r.floor, dateKey);
      return { ...r, use, reserved };
    });
  }, [dateKey, occ]);

  const freeRooms = processedRooms.filter((r) => !r.use && !r.reserved);
  const occRooms = processedRooms.filter((r) => r.use);
  const reservedRooms = processedRooms.filter((r) => r.reserved);

  // 全期都沒被使用的課室（隨時可施工）
  const alwaysFreeCodes = useMemo(() => {
    const usedEver = new Set();
    dateList.forEach((d) => {
      // Both actual occupancy and reservations count as "used" for the "Always Free" calculation
      Object.keys(occupancy[d].rooms).forEach((c) => usedEver.add(c));
      allRooms.forEach(r => {
        if (isReserved(r.floor, d)) usedEver.add(r.code);
      });
    });
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
        <p>綠色 = 空置（可施工）　灰色 = 保留（不可施工）　彩色 = 已被使用（須避開）</p>
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
            <span>{Object.keys(occupancy[d].rooms).length + allRooms.filter(r => isReserved(r.floor, d) && !occupancy[d].rooms[r.code]).length} 間須避開</span>
          </button>
        ))}
      </div>

      {/* 統計 */}
      <div className="stats">
        <div className="stat s-used"><b>{occRooms.length}</b>已被使用</div>
        <div className="stat s-reserved"><b>{reservedRooms.length}</b>保留中</div>
        <div className="stat s-free"><b>{freeRooms.length}</b>本日可施工</div>
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
                const room = processedRooms.find((r) => r.floor === f && r.col === c);
                if (!room) return <div key={c} className="cell empty" />;
                
                const isAlwaysFree = alwaysFreeCodes.has(room.code);
                const bg = room.use ? purposeColors[room.use.p] || "#ef4444" : null;
                
                let cellClass = "cell ";
                if (room.use) cellClass += "used";
                else if (room.reserved) cellClass += "reserved";
                else if (isAlwaysFree) cellClass += "free always-free";
                else cellClass += "free";

                return (
                  <div
                    key={c}
                    className={cellClass}
                    style={room.use ? { background: bg } : {}}
                    onClick={() => setSel({ ...room, isAlwaysFree })}
                    title={room.code}
                  >
                    <div className="rname">{room.name}</div>
                    <div className="rcode">{room.code}</div>
                    {room.use ? (
                      <div className="rinfo">{room.use.t}<br/>{room.use.p}</div>
                    ) : room.reserved ? (
                      <div className="rres">保留中 🔒</div>
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
            <span className="lg lg-free">空置 / 可施工</span>
            <span className="lg lg-priority">★ 優先 / 全期空置</span>
            <span className="lg lg-reserved">🔒 保留 (不可施工)</span>
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
                  <p className="warn">⚠ 此日已被佔用，請勿施工</p>
                </>
              ) : sel.reserved ? (
                <p className="warn">⚠ 此樓層於此段時間已被保留，請勿施工</p>
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
                {alwaysFreeCodes.has(r.code) && <b style={{color:'#059669', marginLeft:'4px'}}>★</b>}
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
