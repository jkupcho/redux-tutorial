const { connect } = ReactRedux;

const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
};

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};

const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
}

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) { return state; }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map((t) => todo(t, action));
    default:
      return state;
  }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const { combineReducers } = Redux;
const { Component } = React;

const todoApp = combineReducers({ todos, visibilityFilter });

const Link = ({
  active,
  children,
  onClick
}) => {
  if (active) {
    return <span>{children}</span>;
  }
  
  return (
    <a href='#'
      onClick={e => {
        e.preventDefault();
        onClick()
      }}
    >
      {children}
    </a>
  )
};

const mapStateToLinkProps = (
  state,
  // This is the container props, not the child props.
  ownProps
) => {
    return {
      active:
        ownProps.filter === state.visibilityFilter
    };
};

const mapDispatchToLinkProps =(
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  };
};

const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link);

const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
  }
}

const Todo = ({
  onClick,
  completed,
  text
}) => (
  <li 
    onClick={onClick}
    style={{
      textDecoration: 
        completed ? 
          'line-through' : 
          'none'
    }}
  >
    {text}
  </li>
);

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo => 
      <Todo
         key={todo.id}
         {...todo}
         onClick={() => onTodoClick(todo.id)}
      />
     )}
  </ul>
);

let nextTodoId = 0;
let AddTodo = ({ dispatch }) => {
  let input;
  
  return (
    <div>
      <input ref={node => { input = node; }} />
      <button onClick={() => { 
        dispatch(addTodo(input.value));
        input.value = ''; 
      }}>
        Add Todo
      </button>
    </div>
  );
};
// This will inject 'dispatch' as a prop.
AddTodo = connect()(AddTodo);

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'>
      All
    </FilterLink>
    {', '}
    <FilterLink
      filter='SHOW_ACTIVE'>
      Active
    </FilterLink>
    {', '}
    <FilterLink
      filter='SHOW_COMPLETED'>
      Completed
    </FilterLink>
  </p>
);

/* START - This generates the 'container' component */

const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  };
};

const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id));
    }
  };
};
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);
/* END - This generates the 'container' component */

const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

const { createStore } = Redux;
const { Provider } = ReactRedux;

Provider.childContextTypes = {
  store: React.PropTypes.object
};


ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp store={createStore(todoApp)} />
  </Provider>,
  document.getElementById('root')
);