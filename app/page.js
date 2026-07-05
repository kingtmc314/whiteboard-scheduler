"use client";
import { useMemo, useState, useEffect } from "react";
import { layout, occupancy, dateList, purposeColors, equipment, manualReservations } from "../lib/data";
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://awvpavxgsikzmmrwspqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dnBhdnhnc2lrem1tcndzcHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODU5NjksImV4cCI6MjA5NDY2MTk2OX0.sdUtxrN0YYsyw5BKPjB-2A74vDB4g6fIBE79cIfF0qU';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch progress from Supabase
  useEffect(() => {
    async function fetchProgress() {
      const { data, error } = await supabase.from('construction_progress').select('*');
      if (data) {
        const progressMap = {};
        data.forEach(item => {
          progressMap[item.room_code] = { wb: item.wb, pa: item.pa, socket: item.socket };
        });
        setCompletedTasks(progressMap);
      }
      setIsLoading(false);
    }
    fetchProgress();
  }, []);

  const toggleTask = async (roomCode, taskType) => {
    const current = completedTasks[roomCode] || { wb: false, pa: false, socket: false };
    const updatedTask = { ...current, [taskType]: !current[taskType] };
    
    const updatedProgress = { ...completedTasks, [roomCode]: updatedTask };
    setCompletedTasks(updatedProgress);

    const { error } = await supabase.from('construction_progress').upsert({
      room_code: roomCode,
      wb: updatedTask.wb,
      pa: updatedTask.pa,
      socket: updatedTask.socket,
      updated_at: new Date().toISOString()
    });
    
    if (error) console.error('Supabase Sync Error:', error);
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
                      <input type="checkbox" checked={completedTasks[sel.code]?.wb || false} onChange={() => toggleTask(sel.code, 'wb')} />
                      📺 電子白板
                    </label>
                  )}
                  {sel.info.pa === 1 && (
                    <label className="p-item">
                      <input type="checkbox" checked={completedTasks[sel.code]?.pa || false} onChange={() => toggleTask(sel.code, 'pa')} />
                      🔊 音響 PA
                    </label>
                  )}
                  {sel.info.socket === 1 && (
                    <label className="p-item">
                      <input type="checkbox" checked={completedTasks[sel.code]?.socket || false} onChange={() => toggleTask(sel.code, 'socket')} />
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
            <h2>設備清單 (各房需求)</h2>
            <div className="floor-filter">
              <label>樓層：</label>
              <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                <option value="All Floors">所有</option>
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="room-cards">
            {allRooms.filter(r => selectedFloor === "All Floors" || r.floor === selectedFloor).map(r => {
              const info = equipment[r.code] || { wb: 0, pa: 0, socket: 0, remark: "" };
              const progress = completedTasks[r.code] || { wb: false, pa: false, socket: false };
              return (
                <div key={r.code} className="room-card">
                  <div className="card-head">
                    <span className="c-code">{r.code}</span>
                    <span className="c-name">{r.name}</span>
                  </div>
                  <div className="card-body">
                    <div className="equip-item">
                      <span>📺 電子白板</span>
                      <span className={info.wb ? "status-tag need" : "status-tag none"}>{info.wb ? "需要" : "不需"}</span>
                    </div>
                    <div className="equip-item">
                      <span>🔊 音響 PA</span>
                      <span className={info.pa ? "status-tag need" : "status-tag none"}>{info.pa ? "需要" : "不需"}</span>
                    </div>
                    <div className="equip-item">
                      <span>🔌 電制插座</span>
                      <span className={info.socket ? "status-tag need" : "status-tag none"}>{info.socket ? "需要" : "不需"}</span>
                    </div>
                    {info.remark && <div className="remark">註：{info.remark}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "summary" && (
        <div className="summary-view">
          <div className="equip-header">
            <h2>總表 (合併資訊)</h2>
            <div className="filter-row">
              <div className="date-dropdown">
                <select value={dateKey} onChange={(e) => setDateKey(e.target.value)}>
                  {dateList.map(d => (
                    <option key={d} value={d}>{occupancy[d].label}</option>
                  ))}
                </select>
              </div>
              <div className="floor-filter">
                <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                  <option value="All Floors">所有樓層</option>
                  {floors.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>樓層</th>
                  <th>房號</th>
                  <th>名稱</th>
                  <th>本日狀態</th>
                  <th>白板</th>
                  <th>音響</th>
                  <th>電制</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                {processedRooms.filter(r => selectedFloor === "All Floors" || r.floor === selectedFloor).map(r => {
                  const info = equipment[r.code] || { wb: 0, pa: 0, socket: 0, remark: "" };
                  let statusText = "可施工";
                  let statusClass = "s-free";
                  if (r.allDone) { statusText = "已完成"; statusClass = "s-done"; }
                  else if (r.use) { statusText = `佔用 (${r.use.t})`; statusClass = "s-used"; }
                  else if (r.reserved) { statusText = "保留中"; statusClass = "s-res"; }
                  else if (alwaysFreeCodes.has(r.code)) { statusText = "優先施工 ★"; statusClass = "s-priority"; }

                  return (
                    <tr key={r.code}>
                      <td>{r.floor}</td>
                      <td>{r.code}</td>
                      <td>{r.name}</td>
                      <td><span className={`status-pill ${statusClass}`}>{statusText}</span></td>
                      <td><span className={info.wb ? "status-tag need" : "status-tag none"}>{info.wb ? "需要" : "不需"}</span></td>
                      <td><span className={info.pa ? "status-tag need" : "status-tag none"}>{info.pa ? "需要" : "不需"}</span></td>
                      <td><span className={info.socket ? "status-tag need" : "status-tag none"}>{info.socket ? "需要" : "不需"}</span></td>
                      <td className="s-remark">{info.remark}</td>
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
