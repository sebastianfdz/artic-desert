import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import './GitTimeline.css';
import Modal from './ModalComponent/Modal.component';
// import { gitTimelineData } from '../../mocks/GitTimeline/gitTimeline';
import { TimeliineDot } from './TimelineDotComponent/TimeliineDot.component';
import { useRepo } from '../../hooks/use-repo';
// import { BranchLine } from './BranchLineComponent/BranchLine.component';
import { useDispatch } from 'react-redux';
import { setBranches } from '../../redux/branches/actions';

// const pathVariants = {
//   hidden: {
//     opacity: 0,
//     pathLength: 0,
//   },
//   visible: {
//     opacity: 1,
//     pathLength: 1,
//     transition: {
//       duration: 3,
//       ease: 'easeInOut',
//     },
//   },
// };

export const GitTimeline: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCommit, setCurrentCommit] = useState<string | number>('');
  const [gitTimelineData, setGitTimelineData] = useState<any>([]); //eslint-disable-line

  const close = () => setModalOpen(false);
  const dispatch = useDispatch();

  const { repo } = useRepo();

  const getTimeLineData = async () => {
    const body = JSON.stringify({
      repo_name: repo.name,
      repo_owner: repo.owner.login,
      token: process.env.REACT_APP_GHP_TOKEN,
    });

    const response = await fetch(
      'https://arctic-desert.herokuapp.com/timeline',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      },
    );

    const responseParsed: any[] = await response.json(); //eslint-disable-line
    console.log('RESPONSE PARSED: ', responseParsed);
    setGitTimelineData(responseParsed);
  };

  useEffect(() => {
    getTimeLineData();
  }, []);

  const branchesOrdered: string[] =
    gitTimelineData?.length && gitTimelineData[0];

  const arrays: (number | string)[][] =
    gitTimelineData?.length && gitTimelineData[1];

  useEffect(() => {
    dispatch(setBranches(branchesOrdered ? branchesOrdered : []));
  }, [branchesOrdered]);

  const colors = [
    '#56FB08',
    '#00ffff',
    '#df1bfd',
    '#ff0000',
    '#ffff00',
    '#ff8400',
  ];

  const branchProps: { [key: string]: string } = {};
  branchesOrdered &&
    branchesOrdered.forEach((branch: string, index: number) => {
      branchProps[branch] = colors[index];
    });

  const constraintsRef = useRef(null);

  const height = 50 * (arrays && arrays[0].length);
  const width = 50 * (arrays && arrays.length);
  return (
    gitTimelineData?.length && (
      <>
        <motion.div className="svg-cont" ref={constraintsRef}>
          <motion.svg
            drag={'x'}
            dragConstraints={{ left: -width, right: 0 }}
            // dragConstraints={constraintsRef}
            dragElastic={0.001}
            className="the-svg"
            xmlns="http://www.w3.org/2000/svg"
            width={String(width) + 'px'}
            height={String(height) + 'px'}
            viewBox={`0 0 ${width} ${height}`}>
            <path stroke="#ff0000" d={`M0 400, ${width} 400`} />
            <path stroke="#df1bfd" d={`M0 450, ${width} 450`} />
            <path stroke="#00ffff" d={`M0 500, ${width} 500`} />
            <path stroke="#56FB08" d={`M0 550, ${width} 550`} />
            <path stroke="#ffff00" d={`M0 350, ${width} 350`} />
            <path stroke="#ff8400" d={`M0 300, ${width} 300`} />
            {/* {arrays.map(array => {
              return array.map((commit: string | number, indexY: number) => {
                return (
                  <BranchLine
                    key={colors[indexY] + indexY}
                    color={colors[indexY]}
                    width={width}
                    height={height - 50 * indexY}
                    pathVariants={pathVariants}
                  />
                );
              });
            })} */}

            {arrays.map((array: (string | number)[], indexX: number) => {
              return array.map((commit: string | number, indexY: number) => {
                return (
                  commit && (
                    <TimeliineDot
                      key={`${indexX}${indexY}`}
                      indexX={indexX}
                      indexY={indexY}
                      branchProps={branchProps}
                      branchesOrdered={branchesOrdered}
                      commit={commit}
                      modalOpen={modalOpen}
                      setModalOpen={setModalOpen}
                      setCurrentCommit={setCurrentCommit}
                    />
                  )
                );
              });
            })}
          </motion.svg>
        </motion.div>
        <AnimatePresence
          initial={false}
          exitBeforeEnter={true}
          onExitComplete={() => null}>
          {modalOpen && (
            <Modal
              commit={currentCommit}
              modalOpen={modalOpen}
              handleClose={close}
            />
          )}
        </AnimatePresence>
      </>
    )
  );
};
