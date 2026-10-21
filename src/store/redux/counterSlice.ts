import React, { createContext, useContext, useReducer } from 'react';

type CounterState = { value: number };
type CounterAction = { type: 'increment' | 'decrement' | 'reset' };

const initialState: CounterState = { value: 0 };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return { value: state.value + 1 };
    case 'decrement':
      return { value: state.value - 1 };
    case 'reset':
      return { value: 0 };
    default:
      return state;
  }
}

const ReduxDemoContext = createContext<{
  state: CounterState;
  dispatch: React.Dispatch<CounterAction>;
}>({ state: initialState, dispatch: () => {} });

export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  return React.createElement(
    ReduxDemoContext.Provider,
    { value: { state, dispatch } },
    children
  );
};

export const useReduxDemo = () => useContext(ReduxDemoContext);