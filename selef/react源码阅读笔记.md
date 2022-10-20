react源码阅读笔记
===
#### 整体架构图

初始化函数执行调用栈:
![初始化函数执行调用栈](img/react函数调用栈.png);

根据函数调用栈分类可以看到整个react 渲染分为三个阶段，入口、render、以及commit 三个阶段


#### 入口阶段

入口阶段主要是创建fiber根节点，全局创建事件合成机制，具体的调用函数为：

1. reactDom.render 注入根节点，以及绑定的容器 containner
```jsx
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
```
2. render 中执行legacyRenderSubtreeIntoContainer 方法(其余方法为校验参数是否合法之类不影响主流程的函数)
```js
  legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback,
  );
```
3. legacyRenderSubtreeIntoContainer 中具体具体做了哪些内容
``` js
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: Container,
  forceHydrate: boolean,
  callback: ?Function,
) {
  if (__DEV__) {
    topLevelUpdateWarnings(container);
    warnOnInvalidCallback(callback === undefined ? null : callback, 'render');
  }
  let root = container._reactRootContainer;
  let fiberRoot: FiberRoot;
  if (!root) {
    // 第一次执行时root肯定为空
    // 执行legacyCreateRootFromDOMContainer返回了fiber根节点
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      // 实体dom对象
      container,
      // 由上文可以看出 第一次这个参数为false
      forceHydrate,
    );
    fiberRoot = root;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    flushSync(() => {
      console.log('flush sync done');
      // updateContainer render 阶段的开始 传入fiber根节点
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    fiberRoot = root;
    // Update
    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  window.fiberRoot = root;
  return getPublicRootInstance(fiberRoot);
}
```

legacyCreateRootFromDOMContainer 干了什么？
```js
function  legacyCreateRootFromDOMContainer(
  container: Container,
  forceHydrate: boolean,
): FiberRoot {
  // First clear any existing content.
  if (!forceHydrate) {
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }
  // 创建fiber根节点
  const root = createContainer(
    container,
    LegacyRoot, // 常量0
    forceHydrate,
    null, // hydrationCallbacks
    false, // isStrictMode
    false, // concurrentUpdatesByDefaultOverride,
  );
  // 没啥用
  markContainerAsRoot(root.current, container);

  const rootContainerElement =
    container.nodeType === COMMENT_NODE ? container.parentNode : container;
    // 对顶层dom 进行事件合成合并
  listenToAllSupportedEvents(rootContainerElement);

  return root;
}
```

重点在这个createContainer中  createContainer 实际上就是执行的createFiberRoot；也就是说这个地方是创建fiber根节点的地方 而第一次的传参为 根节点dom 常量0 false null false false；
实际上就是创建了一个根fiber节点 给这个fiber节点绑定了初始状态、初始更新队列
```js
export function createFiberRoot(
  containerInfo: any,
  tag: RootTag,
  hydrate: boolean,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean,
): FiberRoot {
  // 创建fiber节点对象
  const root: FiberRoot = (new FiberRootNode(containerInfo, tag, hydrate): any);
  if (enableSuspenseCallback) {
    root.hydrationCallbacks = hydrationCallbacks;
  }

  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber(
    tag,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
  );
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  if (enableCache) {
    const initialCache = createCache();
    retainCache(initialCache);

    // The pooledCache is a fresh cache instance that is used temporarily
    // for newly mounted boundaries during a render. In general, the
    // pooledCache is always cleared from the root at the end of a render:
    // it is either released when render commits, or moved to an Offscreen
    // component if rendering suspends. Because the lifetime of the pooled
    // cache is distinct from the main memoizedState.cache, it must be
    // retained separately.
    root.pooledCache = initialCache;
    retainCache(initialCache);
    const initialState = {
      element: null,
      cache: initialCache,
    };
    uninitializedFiber.memoizedState = initialState;
  } else {
    const initialState = {
      element: null,
    };
    uninitializedFiber.memoizedState = initialState;
  }

  initializeUpdateQueue(uninitializedFiber);

  return root;
}

```

```js flushSync 干嘛了 (不理解,大概看起来就是执行了一个回调)
export function flushSync(fn) {
  // In legacy mode, we flush pending passive effects at the beginning of the
  // next event, not at the end of the previous one.
  if (
    rootWithPendingPassiveEffects !== null &&
    rootWithPendingPassiveEffects.tag === LegacyRoot &&
    (executionContext & (RenderContext | CommitContext)) === NoContext
  ) {
    flushPassiveEffects();
  }

  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;

  const prevTransition = ReactCurrentBatchConfig.transition;
  const previousPriority = getCurrentUpdatePriority();
  try {
    ReactCurrentBatchConfig.transition = 0;
    setCurrentUpdatePriority(DiscreteEventPriority);
    if (fn) {
      return fn();
    } else {
      return undefined;
    }
  } finally {
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;
    executionContext = prevExecutionContext;
    // Flush the immediate callbacks that were scheduled during this batch.
    // Note that this will happen even if batchedUpdates is higher up
    // the stack.
    if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
      flushSyncCallbacks();
    }
  }
}
```

#### render阶段
render 阶段主要是创建fiber树以及生成effectList
根据上一节的内容我们可以分析出主函数为updateContainer
```ts
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): Lane {
  if (__DEV__) {
    onScheduleRoot(container, element);
  }
  const current = container.current;
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);

  // 看起来根context 有关，应该是给容器绑定ReactContext值
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }

  // 这一段目前来应该没啥用创建了一个更新对象，看注释的话 好像是给react devtools用的
  const update = createUpdate(eventTime, lane);
  // Caution: React DevTools currently depends on this property
  // being called "element".
  update.payload = {element};

  enqueueUpdate(current, update, lane);
  
  // 核心执行的函数 需要关注
  const root = scheduleUpdateOnFiber(current, lane, eventTime);
  if (root !== null) {
    entangleTransitions(root, current, lane);
  }

  return lane;
}
```

```ts
scheduleUpdateOnFiber
```

// 谈谈对react 整体的理解
// 1 jsx 是一种语法，会被babel转移成如下图的一种格式
// 2 react 会从根节点开始，以深度优先遍历的形式，遍历每个子节点 生成fiber 树 fiber主要作用是切割任务。以及触发提交阶段，渲染真实dom
// 3 每次更新重新从你触发更新的节点开始，计算从此往下的diff，然后触发提交阶段，渲染真实dom
// fiber主要的执行流程
// react 当中的事物机制
// 