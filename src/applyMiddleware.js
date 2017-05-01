import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 *
 * createStore，调用方式createStore(reducer,preloadedState,applyMiddleware(...middlewares))
 * enhancer(createStore)(reducer, preloadedState)
 * applyMiddleware增强了dispatch方法。
 *
 * 中间件形式：(store)=>(next)=>(action)=>{函数体}
 *
 * compose(f,g,h) 返回 (...args)=>f(g(h(...args)))
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    var store = createStore(reducer, preloadedState, enhancer)
    var dispatch = store.dispatch
    var chain = []

    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action) //这里的dispatch始终指向最新的dispatch（应用过所有的middlewares后的dispatch）
    } //暴露给middleware的Store的API
    chain = middlewares.map(middleware => middleware(middlewareAPI)) //这一步，每一个middleware都执行到了，middleware(store)
    dispatch = compose(...chain)(store.dispatch)
    //这里执行后，每一个middleware都执行到了，middleware(store)(next)
    //compose(...chain)返回 (...args)=>M1(M2(M3(...args)))
    //compose(...chain)(store.dispatch)等价于M1(M2(M3(store.dispatch)))
    //next=M3(store.dispatch),next=M2(next),dispatch=M1(next);

    return {
      ...store,
      dispatch
    }
  }
}
