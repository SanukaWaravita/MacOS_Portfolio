import React, { useRef } from 'react'

const Welcome = () => {
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

  return (
    <section id="welcome">
        <p ref={subtitleRef}>Hey, I's Gojo! Welcome to my</p>
        <h1 ref={titleRef} className="mt-7">
            portfolio
        </h1>

        <div className="small-screen">
            <p>This Portfolio is designed for desktop/tablet screens only.</p>
        </div>
    </section>
  )
}

export default Welcome