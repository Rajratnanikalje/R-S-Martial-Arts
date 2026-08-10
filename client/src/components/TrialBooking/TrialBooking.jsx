import { useState } from "react";
import api from "../../services/api";
import "./TrialBooking.css";

function TrialBooking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    age: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/trials",
        formData
      );

      alert(response.data.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
        program: "",
        age: "",
        message: "",
      });
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <section className="trial-booking" id="trial">
      <div className="trial-container">

        <div className="trial-content">
          <h2>Book Your Free Trial</h2>

          <p>
            Experience world-class martial arts training with our certified
            instructors. Join a free trial class and discover the right program
            for you.
          </p>

          <ul>
            <li>✅ Certified Trainers</li>
            <li>✅ Modern Training Facility</li>
            <li>✅ Kids & Adults Programs</li>
            <li>✅ Flexible Timings</li>
            <li>✅ Free First Trial Class</li>
          </ul>
        </div>

        <div className="trial-form">
          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            >
              <option value="">Select Program</option>
              <option>Karate</option>
              <option>Thang-Ta Martial Arts</option>
              <option>Kudo</option>
              <option>Kickboxing</option>
              <option>Fitness Training</option>
              <option>Self Defense</option>
              <option>Kids Martial Arts</option>
              <option>Personal Training</option>
            </select>

            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
            />

            <button type="submit">
              Book Free Trial
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}

export default TrialBooking;
