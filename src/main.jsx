// TODO: 화면 가운데 정렬시키기
// TODO: 추후 이미지 바꾸기

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { FRUITS_BASE } from './fruits';

const Main = () => {
  const matterCanvasRef = useRef(null);

  useEffect(() => {
    const { Bodies, Engine, Render, Runner, World } = Matter;

    const engine = Engine.create();
    const render = Render.create({
      canvas: matterCanvasRef.current,
      engine: engine,
      options: {
        wireframes: false,
        background: '#F7F4C8',
        width: 620,
        height: 850,
      },
    });

    const world = engine.world;

    // 왼쪽으로부터 15만큼 떨어지고, 왼쪽 벽의 중앙 부분이 395 ( * 참고 matter-js는 중앙부분으로 계산함 )
    // 왼쪽 벽
    const leftWall = Bodies.rectangle(15, 395, 30, 790, {
      isStatic: true,
      render: { fillStyle: '#E6B143' },
    });
    // 오른쪽 벽
    const rightWall = Bodies.rectangle(605, 395, 30, 790, {
      isStatic: true,
      render: { fillStyle: '#E6B143' },
    });
    // 바닥
    const ground = Bodies.rectangle(310, 820, 620, 60, {
      isStatic: true,
      render: { fillStyle: '#E6B143' },
    });

    const topLine = Bodies.rectangle(310, 150, 620, 2, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#E6B143' },
    });

    World.add(world, [leftWall, rightWall, ground, topLine]);

    Render.run(render);
    Runner.run(engine);

    let currentBody = null;
    let currentFruit = null;

    function addFruit() {
      const index = Math.floor(Math.random() * 5);
      const fruit = FRUITS_BASE[index];

      const body = Bodies.circle(300, 50, fruit.radius, {
        index: index,
        isSleeping: true, // 과일이 떨어지지 않고 준비된 상태를 만들기 위함
        render: {
          sprite: { texture: `${fruit.name}.png` },
        },
        restitution: 0.3,
      });

      currentBody = body;
      currentFruit = fruit;

      World.add(world, body);
    }

    addFruit();

    return () => {
      Render.stop(render);
      Runner.stop(engine);
    };
  }, []);

  return <canvas ref={matterCanvasRef} />;
};

export default Main;
