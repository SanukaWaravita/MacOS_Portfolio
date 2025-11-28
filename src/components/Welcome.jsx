import React, { useRef } from 'react'

const renderText = (text, className, baseWeight = 400) => {
    return [... text].map((char, i) => (
        <span
            key={i}
            className={className}
            style={{ fontVariationSettings: `'whgt ${baseWeight}`}}
        >
            {char === " " ? '\u00A0' : char}
        </span>
    ))
}

const Welcome = () => {
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

  return (
    <section id="welcome">
        <p ref={subtitleRef}>
            {renderText("Hey, I's Gojo! Welcome to my", 
                        'text-3xl font-georama', 
                        100,
            )}
        </p>
        <h1 ref={titleRef} className="mt-7">
            {renderText("portfolio", 
                        'text-9xl italic font-georama'
            )}
        </h1>

        <div className="small-screen">
            <p>This Portfolio is designed for desktop/tablet screens only.</p>
        </div>
    </section>
  )
}

export default Welcome