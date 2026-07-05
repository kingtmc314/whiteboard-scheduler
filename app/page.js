"use client";
import { useMemo, useState, useEffect } from "react";
import { layout, occupancy, dateList, purposeColors, equipment, manualReservations } from "../lib/data";

const floors = ["7/F", "6/F", "5/F", "4/F", "3/F", "2/F", "1/F", "G/F"];
const cols = Array.from({ length: 11 }, (_, i) => i + 1);
const allRooms = Object.entries(layout).flatMap(([f, arr]) =>
  arr.map((r) => ({ ...r, floor: f }))
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [dateKey, setDateKey] = useState(dateList[0]);
  const [sel, setSel] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [completedTasks, setCompletedTasks] = useState({});
  const [showFreeModal, setShowFreeModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("construction-progress");
    if (saved) setCompletedTasks(JSON.parse(saved));
  }, []);

  const toggleTask = (roomCode, taskType) => {
    const updated = {
      ...completedTasks,
      [roomCode]: {
        ...(completedTasks[roomCode] || { wb: false, pa: false, socket: false }),
        [taskType]: !completedTasks[roomCode]?.[taskType]
      }
    };
    setCompletedTasks(updated);
    localStorage.setItem("construction-progress", JSON.stringify(updated));
  };

  const day = occupancy[dateKey];
  const occ = day.rooms;

  const isReserved = (floor, code, date) => {
    if (manualReservations[date]?.includes(code)) return true;
    const [year, month, dayStr] = date.split("-").map(Number);
    if (month === 7) {
      if (floor === "7/F" && dayStr >= 20 && dayStr <= 22) return true;
      if (floor === "3/F" && dayStr >= 20 && dayStr <= 23) return true;
      if (floor === "2/F" && dayStr >= 20 && dayStr <= 24) return true;
      if (floor === "6/F" && dayStr >= 20 && dayStr <= 30) return true;
    }
    return false;
  };

  const processedRooms = useMemo(() => {
    return allRooms.map(r => {
      const use = occ[r.code];
      const reserved = !use && isReserved(r.floor, r.code, dateKey);
      const progress = completedTasks[r.code] || { wb: false, pa: false, socket: false };
      const info = equipment[r.code] || { wb: 0, pa: 0, socket: 0 };
      
      // Completion logic: Must have at least one task AND all required tasks must be checked
      const hasTasks = info.wb || info.pa || info.socket;
      const allDone = hasTasks && (!info.wb || progress.wb) && (!info.pa || progress.pa) && (!info.socket || progress.socket);
      
      return { ...r, use, reserved, progress, allDone, hasTasks };
    });
  }, [dateKey, occ, completedTasks]);

  const freeRooms = processedRooms.filter((r) => !r.use && !r.reserved && !r.allDone);
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
      <header className="top-header">
        <h1>電子白板施工避開日子｜2025-2026</h1>
        <div className="nav-tabs">
          <button className={activeTab === "schedule" ? "tab active" : "tab"} onClick={() => setActiveTab("schedule")}>施工進度</button>
          <button className={activeTab === "equipment" ? "tab active" : "tab"} onClick={() => setActiveTab("equipment")}>設備清單</button>
          <button className={activeTab === "summary" ? "tab active" : "tab"} onClick={() => setActiveTab("summary")}>總表</button>
        </div>
      </header>

      {activeTab === "schedule" && (
        <>
          <div className="control-bar">
            <div className="date-dropdown">
              <select value={dateKey} onChange={(e) => { setDateKey(e.target.value); setSel(null); }}>
                {dateList.map(d => (
                  <option key={d} value={d}>
                    {occupancy[d].label} ({Object.keys(occupancy[d].rooms).length + allRooms.filter(r => isReserved(r.floor, r.code, d) && !occupancy[d].rooms[r.code]).length} 須避開)
                  </option>
                ))}
              </select>
            </div>
            <div className="stats-row">
              <span className="c-used"><b>{occRooms.length}</b>佔用</span>
              <span className="c-res"><b>{reservedRooms.length}</b>保留</span>
              <span className="c-free"><b>{freeRooms.length}</b>可施工</span>
              <span className="c-any"><b>{alwaysFreeRooms.length}</b>優先</span>
            </div>
            <button className="free-btn" onClick={() => setShowFreeModal(true)}>
              查看可施工 ({freeRooms.length})
            </button>
          </div>

          <div className="planbox">
            <div className="grid-container">
              <div className="flabel"></div>
              {cols.map((c) => <div key={c} className="chead">{String(c).padStart(2, "0")}</div>)}
              
              {floors.map((f) => (
                <div key={f} style={{ display: 'contents' }}>
                  <div className="flabel">{f}</div>
                  {cols.map((c) => {
                    const room = processedRooms.find((r) => r.floor === f && r.col === c);
                    if (!room) return <div key={`${f}-${c}`} className="cell empty" />;
                    const isAlwaysFree = alwaysFreeCodes.has(room.code);
                    const info = equipment[room.code] || { wb: 0, pa: 0, socket: 0 };
                    
                    let cellClass = "cell ";
                    if (room.use) cellClass += "used";
                    else if (room.reserved) cellClass += "reserved";
                    else if (room.allDone) cellClass += "done";
                    else if (isAlwaysFree) cellClass += "free always-free";
                    else cellClass += "free";

                    return (
                      <div
                        key={room.code}
                        className={cellClass}
                        style={room.use ? { background: purposeColors[room.use.p] || "#ef4444" } : {}}
                        onClick={() => setSel({ ...room, isAlwaysFree, info })}
                      >
                        <div className="rname">{room.name}</div>
                        <div className="rcode">{room.code}</div>
                        {room.use ? (
                          <>
                            <div className="rinfo">{room.use.t} | {room.use.p}</div>
                            <div className="warn-label">須避開</div>
                          </>
                        ) : room.reserved ? (
                          <div className="rres">保留 🔒</div>
                        ) : room.allDone ? (
                          <div className="rdone">完成 ✓</div>
                        ) : (
                          <div className="tasks icon-only">
                            {info.wb === 1 && <span className={room.progress.wb ? "t-tag done" : "t-tag"} title="白板">📺</span>}
                            {info.pa === 1 && <span className={room.progress.pa ? "t-tag done" : "t-tag"} title="音響">🔊</span>}
                            {info.socket === 1 && <span className={room.progress.socket ? "t-tag done" : "t-tag"} title="電制">🔌</span>}
                            {!info.wb && !info.pa && !info.socket && <div className="rok">{isAlwaysFree ? "★" : "✓"}</div>}
                          </div>
                        )}
                        {isAlwaysFree && !room.use && !room.reserved && !room.allDone && (info.wb || info.pa || info.socket) && <div className="p-star">★</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="bottom-info">
            <div className="legend">
              <span className="lg lg-free">可施工</span>
              <span className="lg lg-priority">★ 優先</span>
              <span className="lg lg-reserved">🔒 保留</span>
              <span className="lg lg-done">✓ 完成</span>
            </div>
            <footer>房號 = S+樓層+欄號</footer>
          </div>

          {sel && (
            <aside className="side">
              <div className="detail">
                <button className="close-btn" onClick={() => setSel(null)}>✕</button>
                <h3>{sel.name} ({sel.code})</h3>
                <div className="progress-tracker">
                  {sel.info.wb === 1 && (
                    <label className="p-item">
                      <input type="checkbox" checked={sel.progress.wb} onChange={() => toggleTask(sel.code, 'wb')} />
                      📺 電子白板
                    </label>
                  )}
                  {sel.info.pa === 1 && (
                    <label className="p-item">
                      <input type="checkbox" checked={sel.progress.pa} onChange={() => toggleTask(sel.code, 'pa')} />
                      🔊 音響 PA
                    </label>
                  )}
                  {sel.info.socket === 1 && (
                    <label className="p-item">
                      <input type="checkbox" checked={sel.progress.socket} onChange={() => toggleTask(sel.code, 'socket')} />
                      🔌 電制插座
                    </label>
                  )}
                </div>
                {sel.use ? (
                  <div className="msg-box error">
                    <p><b>使用人：</b>{sel.use.t} | {sel.use.p}</p>
                    <p className="warn">⚠ 請勿施工</p>
                  </div>
                ) : sel.reserved ? (
                  <div className="msg-box error"><p className="warn">⚠ 已保留，請勿施工</p></div>
                ) : sel.allDone ? (
                  <div className="msg-box success"><p className="okmsg">✓ 工程已完成</p></div>
                ) : (
                  <div className="msg-box success"><p className="okmsg">{sel.isAlwaysFree ? "★ 優先施工" : "✓ 可施工"}</p></div>
                )}
              </div>
            </aside>
          )}

          {showFreeModal && (
            <div className="modal-overlay" onClick={() => setShowFreeModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>本日可施工（{freeRooms.length}）</h3>
                  <button className="close-btn" onClick={() => setShowFreeModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <ul className="modal-list">
                    {freeRooms.map((r) => (
                      <li key={r.code}>
                        <span className="m-floor">{r.floor}</span>
                        <span className="m-name">{r.name}</span>
                        {alwaysFreeCodes.has(r.code) && <b className="m-star">★</b>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "equipment" && (
        <div className="equipment-view">
          <div className="equip-header">
            <div className="floor-filter">
              <label>樓層：</label>
              <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                <option value="All Floors">所有</option>
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
                    const progress = completedTasks[r.code] || { wb: false, pa: false, socket: false };
                    return (
                      <div key={r.code} className="room-card">
                        <div className="card-head">
                          <span className="c-code">{r.code}</span>
                          <span className="c-name">{r.name}</span>
                        </div>
                        <div className="card-body">
                          {info.wb === 1 && <div className={`item ${progress.wb ? 'done' : 'need'}`}>📺 白板</div>}
                          {info.pa === 1 && <div className={`item ${progress.pa ? 'done' : 'need'}`}>🔊 音響</div>}
                          {info.socket === 1 && <div className={`item ${progress.socket ? 'done' : 'need'}`}>🔌 電制</div>}
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
              <select value={dateKey} onChange={(e) => setDateKey(e.target.value)}>
                {dateList.map(d => <option key={d} value={d}>{occupancy[d].label}</option>)}
              </select>
            </div>
            <div className="floor-filter">
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
                  <th>樓層</th><th>房號</th><th>名稱</th><th>狀態</th><th>白板</th><th>音響</th><th>電制</th>
                </tr>
              </thead>
              <tbody>
                {allRooms.filter(r => selectedFloor === "All Floors" || r.floor === selectedFloor).map(r => {
                  const info = equipment[r.code] || { wb: 0, pa: 0, socket: 0, remark: "" };
                  const use = occ[r.code];
                  const reserved = !use && isReserved(r.floor, r.code, dateKey);
                  const isAlwaysFree = alwaysFreeCodes.has(r.code);
                  const progress = completedTasks[r.code] || { wb: false, pa: false, socket: false };
                  
                  const hasTasks = info.wb || info.pa || info.socket;
                  const allDone = hasTasks && (!info.wb || progress.wb) && (!info.pa || progress.pa) && (!info.socket || progress.socket);
                  
                  let statusText = allDone ? "完成" : "可施工";
                  let statusClass = allDone ? "s-done" : "s-free";
                  if (use) { statusText = use.t; statusClass = "s-used"; }
                  else if (reserved) { statusText = "保留"; statusClass = "s-reserved"; }
                  else if (isAlwaysFree) { statusText = "優先 ★"; statusClass = "s-priority"; }

                  return (
                    <tr key={r.code}>
                      <td>{r.floor}</td><td><b>{r.code}</b></td><td>{r.name}</td>
                      <td className={statusClass}>{statusText}</td>
                      <td>{info.wb === 1 ? (progress.wb ? "✓" : "需要") : "-"}</td>
                      <td>{info.pa === 1 ? (progress.pa ? "✓" : "需要") : "-"}</td>
                      <td>{info.socket === 1 ? (progress.socket ? "✓" : "需要") : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
