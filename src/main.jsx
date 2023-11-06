import React, { useState, useEffect } from "react";
import { useMatter } from "react-matter-js";
import { Body, Events } from "matter-js";

const Main = () => {
  const [THEME, setTHEME] = useState("halloween");
  const [FRUITS, setFRUITS] = useState([]);

  const { world, engine, render } = useMatter();

  useEffect(() => {
    switch (THEME) {
      case "halloween":
        setFRUITS(["pumpkin", "ghost", "witch"]);
        break;
      default:
        setFRUITS(["apple", "banana", "orange"]);
    }
  }, [THEME]);

  const addFruit = () => {
    const index = Math.floor(Math.random() * FRUITS.length);
    const fruit = FRUITS[index];

    const body = world.addBody({
      type: "circle",
      position: { x: 300, y: 50 },
      radius: fruit.radius,
      index: index,
      isSleeping: true,
      sprite: { texture: `${fruit.name}.png` },
    });

    return body;
  };

  const handleKeyDown = (event) => {
    const currentBody = world.bodies.find(body => body.index === FRUITS.length - 1);

    switch (event.code) {
      case "KeyA":
        if (currentBody.position.x - currentBody.radius > 30) {
          Body.setPosition(currentBody, { x: currentBody.position.x - 1 });
        }
        break;
      case "KeyD":
        if (currentBody.position.x + currentBody.radius < 590) {
          Body.setPosition(currentBody, { x: currentBody.position.x + 1 });
        }
        break;
      case "KeyS":
        currentBody.isSleeping = false;

        setTimeout(() => {
          addFruit();
        }, 1000);
        break;
    }
  };

  const handleCollisionStart = (event) => {
    const currentBody = world.bodies.find(body => body.index === FRUITS.length - 1);

    event.pairs.forEach(collision => {
      if (collision.bodyA.index === collision.bodyB.index) {
        const index = collision.bodyA.index;

        if (index === FRUITS.length - 1) {
          return;
        }

        world.removeBody(collision.bodyA);
        world.removeBody(collision.bodyB);

        const newFruit = FRUITS[index + 1];

        const newBody = world.addBody({
          type: "circle",
          position: collision.supports[0],
          radius: newFruit.radius,
          index: index + 1,
          sprite: { texture: `${newFruit.name}.png` },
        });

        if (newBody.position.y < 150) {
          alert("Game over!");
        }
      }
    });
  };

  useEffect(() => {
    render.run();
    engine.run();

    window.addEventListener("keydown", handleKeyDown);
    Events.on(engine, "collisionStart", handleCollisionStart);

    return () => {
      render.stop();
      engine.stop();

      window.removeEventListener("keydown", handleKeyDown);
      Events.off(engine, "collisionStart", handleCollisionStart);
    };
  }, []);

  return (
    <div>
      <canvas ref={render.element} />
    </div>
  );
};

export default Main;
