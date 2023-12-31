// ver 1
// TODO: 완 - 화면 가운데 정렬시키기
//
// TODO: 추후 이미지 바꾸기
// TODO: 게임 오버 시 게임 다시 시작
// TODO: 게임 오버 alert창 한번만 띄우기
// TODO: 게임 오버 기준 선에 2초 닿으면 게임 오버
// TODO: 난이도 조절하기
//
//

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { FRUITS_BASE } from './fruits';

const Main = () => {
  const matterCanvasRef = useRef(null);

  useEffect(() => {
    const { Bodies, Body, Engine, Events, Render, Runner, World } = Matter;

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

    // 윗쪽 시작 선
    const topLine = Bodies.rectangle(310, 150, 620, 2, {
      name: 'topLine',
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#E6B143' },
    });

    World.add(world, [leftWall, rightWall, ground, topLine]);

    Render.run(render);
    Runner.run(engine);

    let currentBody = null;
    let currentFruit = null;
    let disableAction = false;
    let interval = null;
    let gameEnd = 0;

    function addFruit() {
      const index = Math.floor(Math.random() * 5);
      const fruit = FRUITS_BASE[index];

      const body = Bodies.circle(300, 50, fruit.radius, {
        index: index,
        isSleeping: true, // 과일이 떨어지지 않고 준비된 상태를 만들기 위함
        render: {
          sprite: { texture: `${fruit.name}.png` },
        },
        restitution: 0.2, // 물체가 충돌 후 튕겨져 나가는 정도
      });

      currentBody = body;
      currentFruit = fruit;

      World.add(world, body);

      window.onkeydown = (event) => {
        if (disableAction) {
          return;
        }
        // eslint-disable-next-line default-case
        switch (event.code) {
          case 'KeyA':
            if (interval) {
              return;
            }
            // 과일 자연스럽게 움직이기 위해 setInterval 사용
            interval = setInterval(() => {
              if (currentBody.position.x - currentFruit.radius > 30) {
                Body.setPosition(currentBody, {
                  x: currentBody.position.x - 1,
                  y: currentBody.position.y,
                });
              }
            }, 5);

            break;
          case 'KeyD':
            if (interval) {
              return;
            }
            interval = setInterval(() => {
              if (currentBody.position.x + currentFruit.radius < 590) {
                Body.setPosition(currentBody, {
                  x: currentBody.position.x + 1,
                  y: currentBody.position.y,
                });
              }
            }, 5);
            break;
          case 'KeyS':
            currentBody.isSleeping = false;
            disableAction = true;

            setTimeout(() => {
              // 게임 종료 시 더이상 새로운 과일 생성 x
              if (gameEnd < 2) {
                addFruit();
                disableAction = false;
              }
            }, 1000);
            break;
        }
      };
    }

    // 과일이 한쪽으로 계속 이동하는 것 막기 위한 로직
    window.onkeyup = (event) => {
      switch (event.code) {
        case 'KeyA':
        case 'KeyD':
          clearInterval(interval);
          interval = null;
      }
    };

    // 충돌 이벤트
    Events.on(engine, 'collisionActive', (event) => {
      event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;

          // 수박인지 검사해서 수박이면 합치지 않기
          if (index === FRUITS_BASE.length - 1) {
            return;
          }

          // 충돌한 쌍을 삭제
          World.remove(world, [collision.bodyA, collision.bodyB]);

          // 충돌한 과일의 다음 과일
          const newFruit = FRUITS_BASE[index + 1];

          const newBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newFruit.radius,
            {
              render: {
                sprite: { texture: `${newFruit.name}.png` },
              },
              index: index + 1,
            }
          );

          World.add(world, newBody);

          // 승리 조건
          if (newFruit.name === 'fruits_img/10_watermelon') {
            gameEnd++;
            // console.log(newFruit.name, gameEnd, "게임 승리?");
            if (gameEnd > 1) {
              setTimeout(() => {
                alert('게임승리!');
              }, 500);
            }
          }
        }

        if (
          !disableAction &&
          (collision.bodyA.name === 'topLine' ||
            collision.bodyB.name === 'topLine')
        ) {
          alert('Game Over');
        }
      });
    });

    addFruit();

    return () => {
      Render.stop(render);
      Runner.stop(engine);
    };
  }, []);

  return (
    <div>
      <canvas ref={matterCanvasRef} />
    </div>
  );
};

export default Main;
