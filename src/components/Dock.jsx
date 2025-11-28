import React, { useRef } from 'react'
import { Tooltip } from 'react-tooltip';
import gsap from "gsap";

import { dockApps } from '#constants'
import { useGSAP } from '@gsap/react';

const MAGNIFICATION_SPREAD = 500;

/**
 * Dock Component - macOS-style application dock with hover magnification
 * Features: Icon scaling/jumping on hover, tooltips, app launching
 */
const Dock = () => {
  const dockRef = useRef(null);

  // === GSAP Animation Setup ===
  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");

    // Pre-compile GSAP animations for better performance
    icons.forEach((icon) => {
      icon._quickScale = gsap.quickTo(icon, "scale", {duration: 0.2, ease: "power1.out"});
      icon._quickY = gsap.quickTo(icon, "y", {duration: 0.2, ease: "power1.out"});
      icon._quickScaleReset = gsap.quickTo(icon, "scale", {duration: 0.3, ease: "power1.out"});
      icon._quickYReset = gsap.quickTo(icon, "y", {duration: 0.3, ease: "power1.out"});
    });

    // === Magnification Animation ===
    // Calculates and applies scaling/position based on mouse proximity
    const animateIcons = (mouseX) => {
        const { left } = dock.getBoundingClientRect();

        icons.forEach((icon) => {
            const { left: iconLeft, width } = icon.getBoundingClientRect();
            const center = iconLeft - left + width / 2;
            const distance = Math.abs(mouseX - center);

            const intensity = Math.exp(-(distance ** 2) / MAGNIFICATION_SPREAD);

            // Use pre-compiled quickTo setters for better performance
            icon._quickScale(1 + 0.20 * intensity);
            icon._quickY(-15 * intensity);
        })
    };

    // === Event Handlers ===
    // Converts mouse position to dock-relative coordinates
    const handleMouseMove = (e) => {
        const { left } = dock.getBoundingClientRect();

        animateIcons(e.clientX - left);
    };

    // Returns all icons to default state when mouse leaves dock
    const resetIcons = () => 
        icons.forEach((icon) => {
            icon._quickScaleReset(1);
            icon._quickYReset(0);
        });
    
    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', resetIcons);

    return () => {
        dock.removeEventListener("mousemove", handleMouseMove);
        dock.removeEventListener("mouseleave", resetIcons);
    };
  }, []);

  // === App Interaction ===
  // Handles opening/closing applications (placeholder for future windows)
  const toggleApp = (app) => {
    //TODO Implemment Open Window Logic
  }

  return (
    <section id="dock">
        <div ref={dockRef} className="dock-container">
            {dockApps.map(({ id, name, icon, canOpen }) => (
                <div key={id} className="relative flex justify-center">
                    <button 
                        type="button" 
                        className="dock-icon" 
                        aria-label={name} 
                        data-tooltip-id="dock-tooltip" 
                        data-tooltip-content={name}
                        data-tooltip-delay-show={150}
                        disabled={!canOpen}
                        onClick={() => toggleApp({ id, canOpen })}
                        >
                          <img 
                            src={`/images/${icon}`}
                            alt={name}
                            loading="lazy"
                            className={canOpen ? "" : "opacity-60"}
                            />
                    </button>
                </div>
            ))}
            <Tooltip id="dock-tooltip" place="top" className="tooltip"/>
        </div>
    </section>
  );
};

export default Dock