import React from "react";

const ContactUs = () => {
  return (
    <div >
      {/* Header Section */}
      <div
        className="relative h-80 flex items-center pl-10 text-white text-5xl font-bold"
        style={{ backgroundImage: "url('/assets/contact.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <span className="relative">CONTACT US</span>
      </div>

      {/* Contact Form Section */}
      <div className="flex p-10">
        <div className="flex-1 pr-5">
          <h2 className="font-bold text-xl mb-4">OUR <span className="text-black">CONTACT</span></h2>
          <form className="space-y-4">
            <input type="text" placeholder="Name *" required className="w-3/4 p-2 border border-gray-300 rounded" />
            <input type="email" placeholder="Email *" required className="w-3/4 p-2 border border-gray-300 rounded" />
            <input type="text" placeholder="Subject *" required className="w-3/4 p-2 border border-gray-300 rounded" />
            <textarea placeholder="Comment *" required className="w-3/4 p-2 border border-gray-300 rounded h-24"></textarea>
            <div>
              <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded mt-2">SUBMIT</button>
            </div>
          </form>
        </div>

        {/* Google Map Section */}
        <div className="flex-1 flex justify-center items-center">
  <div className="border border-gray-300 rounded overflow-hidden w-[600px] h-[350px]">
    <iframe
      title="Google Map"
      src="https://www.google.com/maps/embed?pb=https://www.google.fr/maps/place/Neopolis+Development/@36.4338557,10.6517655,14z/data=!4m10!1m2!2m1!1sneapolis+web+devlpment+nabeul!3m6!1s0x13029f735ef8ee11:0x12d41a850d426a5c!8m2!3d36.433841!4d10.6898832!15sCh9uZWFwb2xpcyB3ZWIgZGV2ZWxvcG1lbnQgbmFiZXVskgEcYnVzaW5lc3NfZGV2ZWxvcG1lbnRfc2VydmljZeABAA!16s%2Fg%2F11rrp98fzv?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D"
      className="w-full h-full border-0"
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</div>

      </div>

      {/* Footer Section */}
      <div className="bg-teal-600 p-5 text-center text-white">
        DO YOU STILL HAVE A QUESTION REGARDING OUR SERVICES ?
        <button className="bg-red-500 text-white px-6 py-2 rounded ml-3">CONTACT US</button>
      </div>
    </div>
  );
};

export default ContactUs;
