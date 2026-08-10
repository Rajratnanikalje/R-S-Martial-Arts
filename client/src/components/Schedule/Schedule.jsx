import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Schedule.css";

const DEFAULT_SCHEDULE = [
  { day: "Monday", morning: { time: "06:00 AM - 08:00 AM", class: "Karate Training" }, evening: { time: "05:00 PM - 07:00 PM", class: "Kickboxing" } },
  { day: "Tuesday", morning: { time: "06:00 AM - 08:00 AM", class: "Kudo Training" }, evening: { time: "05:00 PM - 07:00 PM", class: "Fitness Training" } },
  { day: "Wednesday", morning: { time: "06:00 AM - 08:00 AM", class: "Thang-Ta Martial Arts" }, evening: { time: "05:00 PM - 07:00 PM", class: "Self Defense" } },
  { day: "Thursday", morning: { time: "06:00 AM - 08:00 AM", class: "Karate Training" }, evening: { time: "05:00 PM - 07:00 PM", class: "Kids Martial Arts" } },
  { day: "Friday", morning: { time: "06:00 AM - 08:00 AM", class: "Fitness Training" }, evening: { time: "05:00 PM - 07:00 PM", class: "Kickboxing" } },
  { day: "Saturday", morning: { time: "06:00 AM - 08:00 AM", class: "Special Training" }, evening: { time: "05:00 PM - 07:00 PM", class: "Personal Training" } }
];

function Schedule() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  useEffect(() => {
    api.get("/timetable")
      .then(({ data }) => {
        const list = Array.isArray(data.timetable) ? data.timetable : [];
        if (list.length) {
          setSchedule(list.map((e) => ({
            day: e.day,
            morning: { time: e.morningTime, class: e.morningClass },
            evening: { time: e.eveningTime, class: e.eveningClass },
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="schedule" id="schedule">
      <div className="schedule-container">
        <p className="section-tag">Class Schedule</p>
        <h2>Weekly Training Timetable</h2>

        {/* Desktop Table View */}
        <div className="table-wrapper desktop-only">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>🌅 Morning Batch</th>
                <th>🌙 Evening Batch</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={index}>
                  <td className="day-name">{item.day}</td>
                  <td>
                    <span className="time-badge">{item.morning.time}</span>
                    <div className="class-name">{item.morning.class}</div>
                  </td>
                  <td>
                    <span className="time-badge">{item.evening.time}</span>
                    <div className="class-name">{item.evening.class}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="mobile-schedule-grid mobile-only">
          {schedule.map((item, index) => (
            <div className="schedule-card" key={index}>
              <div className="card-day">{item.day}</div>
              <div className="card-session">
                <span className="session-title">🌅 Morning</span>
                <span className="session-time">{item.morning.time}</span>
                <span className="session-class">{item.morning.class}</span>
              </div>
              <div className="card-divider"></div>
              <div className="card-session">
                <span className="session-title">🌙 Evening</span>
                <span className="session-time">{item.evening.time}</span>
                <span className="session-class">{item.evening.class}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sunday-notice">
          <span>🚨 Sunday: Closed / Rest & Recovery Day</span>
        </div>
      </div>
    </section>
  );
}

export default Schedule;