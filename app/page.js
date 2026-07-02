"use client";
import { useMemo, useState } from "react";
import { layout, occupancy, dateList, purposeColors, equipment, manualReservations } from "../lib/data";

const floors = ["7/F", "6/F", "5/F", "4/F", "3/F", "2/F", "1/F", "G/F"];
const cols = Array.from({ length: 11 }, (_, i) => i + 1);
const allRooms = Object.entries(layout).flatMap(([f, arr]) =>
  arr.map((r) => ({ ...r, floor: f }))
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("schedule"); // "schedule", "equipment", or "summary"
  const [dateKey, setDateKey] = useState(dateList[0]);
  const [sel, setSel] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const day = occupancy[dateKey];
  const occ = day.rooms;

  // Helper to check if a room should be BLOCKED (Reserved)
  const isReserved = (floor, code, date) => {
    // 1. 手動保留 (Manual Reservations)
    if (manualReservations[date]?.includes(code)) return true;

    // 2. 樓層全域保留 (Floor-wide Reservations)
    const d = parseInt(date.split("-")[2]);
    if (floor === "7/F" && d >= 20 && d <= 22) return true;
    if (floor === "3/F" && d >= 20 && d <= 23) return true;
    if (floor === "2/F" && d >= 20 && d <= 24) return true;
    if (floor === "6/F" && d >= 20 && d <= 30) return true;
    
    return false;
  };

  const processedRooms = useMemo(() => {
    return allRooms.map(r => {
      const use = occ[r.code];
      const reserved = !use && isReserved(r.floor, r.code, dateKey);
      return { ...r, use, reserved };
    });
  }, [dateKey, occ]);

  const freeRooms = processedRooms.filter((r) => !r.use && !r.reserved);
  const occRooms = processedRooms.filter((r) => r.use);
  const reservedRooms = processedRooms.filter((r) => r.reserved);

  const alwaysFreeCodes = useMemo(() => {
    const usedEver = new Set();
    dateList.forEach((d) => {
      Object.keys(occupancy[d].rooms).forEach((c) => usedEver.add(c));
      allRooms.forEach(r => {
        if (isReserved(r.floor, r.code, d)) usedEver.add(r.code);
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
        <div className="nav-tabs">
          <button 
            className={activeTab === "schedule" ? "tab active" : "tab"} 
            onClick={() => setActiveTab("schedule")}
          >
            施工進度表
          </button>
          <button 
            className={activeTab === "equipment" ? "tab active" : "tab"} 
            onClick={() => setActiveTab("equipment")}
          >
            課室設備清單
          </button>
          <button 
            className={activeTab === "summary" ? "tab active" : "tab"} 
            onClick={() => setActiveTab("summary")}
          >
            總表 (合併資訊)
          </button>
        </div>
      </header>

      {activeTab === "schedule" && (
        <>
          <p className="sub-hint">綠色 = 空置（可施工）　灰色 = 保留（不可施工）　彩色 = 已被使用（須避開）</p>
          
          <div className="dates">
            {dateList.map((d) => (
              <button
                key={d}
                className={d === dateKey ? "date active" : "date"}
                onClick={() => { setDateKey(d); setSel(null); }}
              >
                {occupancy[d].label}
                <span>{Object.keys(occupancy[d].rooms).length + allRooms.filter(r => isReserved(r.floor, r.code, d) && !occupancy[d].rooms[r.code]).length} 間須避開</span>
              </button>
            ))}
          </div>

          <div className="stats">
            <div className="stat s-used"><b>{occRooms.length}</b>已被使用</div>
            <div className="stat s-reserved"><b>{reservedRooms.length}</b>保留中</div>
            <div className="stat s-free"><b>{freeRooms.length}</b>本日可施工</div>
            <div className="stat s-any"><b>{alwaysFreeRooms.length}</b>全期隨時可施工</div>
          </div>

          <div className="wrap">
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
              <div className="legend">
                <span className="lg lg-free">空置 / 可施工</span>
                <span className="lg lg-priority">★ 優先 / 全期空置</span>
                <span className="lg lg-reserved">🔒 保留 (不可施工)</span>
                {Object.entries(purposeColors).map(([p, c]) => (
                  <span key={p} className="lg" style={{ background: c }}>{p}</span>
                ))}
              </div>
            </div>

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
                    <p className="warn">⚠ 此課室/樓層於此段時間已被保留，請勿施工</p>
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
            </aside>
          </div>
        </>
      )}

      {activeTab === "equipment" && (
        <div className="equipment-view">
          <div className="equip-header">
            <p className="sub-hint">1 = 需要安裝 / 0 = 不需要安裝</p>
            <div className="floor-filter">
              <label>選擇樓層：</label>
              <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                <option value="All Floors">所有樓層</option>
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="equip-grid">
            {floors.filter(f => selectedFloor === "All Floors" || f === selectedFloor).map(f => (
              <div key={f} className="floor-section">
                <h2>{f}</h2>
                <div className="room-cards">
                  {layout[f].map(r => {
                    const info = equipment[r.code] || { wb: 0, pa: 0, socket: 0, remark: "" };
                    return (
                      <div key={r.code} className="room-card">
                        <div className="card-head">
                          <span className="c-code">{r.code}</span>
                          <span className="c-name">{r.name}</span>
                        </div>
                        <div className="card-body">
                          <div className={`item ${info.wb === 1 ? 'need' : 'none'}`}>
                            <span className="icon">📺</span>
                            <span className="label">安裝電子白板</span>
                            <span className="status">{info.wb === 1 ? '需要' : '不需'}</span>
                          </div>
                          <div className={`item ${info.pa === 1 ? 'need' : 'none'}`}>
                            <span className="icon">🔊</span>
                            <span className="label">安裝課室PA</span>
                            <span className="status">{info.pa === 1 ? '需要' : '不需'}</span>
                          </div>
                          <div className={`item ${info.socket === 1 ? 'need' : 'none'}`}>
                            <span className="icon">🔌</span>
                            <span className="label">加裝電位</span>
                            <span className="status">{info.socket === 1 ? '需要' : '不需'}</span>
                          </div>
                          {info.remark && <div className="remark">註：{info.remark}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "summary" && (
        <div className="summary-view">
          <div className="equip-header">
            <div className="date-select">
              <label>選擇日期：</label>
              <select value={dateKey} onChange={(e) => setDateKey(e.target.value)}>
                {dateList.map(d => <option key={d} value={d}>{occupancy[d].label}</option>)}
              </select>
            </div>
            <div className="floor-filter">
              <label>選擇樓層：</label>
              <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                <option value="All Floors">所有樓層</option>
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table className="sum-table">
              <thead>
                <tr>
                  <th>樓層</th>
                  <th>房號</th>
                  <th>名稱</th>
                  <th>本日狀態</th>
                  <th>電子白板</th>
                  <th>音響 PA</th>
                  <th>電制插座</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                {allRooms.filter(r => selectedFloor === "All Floors" || r.floor === selectedFloor).map(r => {
                  const info = equipment[r.code] || { wb: 0, pa: 0, socket: 0, remark: "" };
                  const use = occ[r.code];
                  const reserved = !use && isReserved(r.floor, r.code, dateKey);
                  const isAlwaysFree = alwaysFreeCodes.has(r.code);
                  
                  let statusText = "可施工 ✓";
                  let statusClass = "s-free";
                  if (use) {
                    statusText = `${use.t} (${use.p})`;
                    statusClass = "s-used";
                  } else if (reserved) {
                    statusText = "保留中 🔒";
                    statusClass = "s-reserved";
                  } else if (isAlwaysFree) {
                    statusText = "優先施工 ★";
                    statusClass = "s-priority";
                  }

                  return (
                    <tr key={r.code}>
                      <td>{r.floor}</td>
                      <td><b>{r.code}</b></td>
                      <td>{r.name}</td>
                      <td className={statusClass}>{statusText}</td>
                      <td className={info.wb === 1 ? "t-need" : "t-none"}>{info.wb === 1 ? "需要" : "不需"}</td>
                      <td className={info.pa === 1 ? "t-need" : "t-none"}>{info.pa === 1 ? "需要" : "不需"}</td>
                      <td className={info.socket === 1 ? "t-need" : "t-none"}>{info.socket === 1 ? "需要" : "不需"}</td>
                      <td className="t-remark">{info.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <footer>資料來源：電子白版施工避開日子_2025-2026.xlsx｜房號 = S+樓層+課室圖欄號</footer>
    </main>
  );
}
