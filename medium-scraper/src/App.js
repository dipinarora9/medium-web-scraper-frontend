import './App.css';
import React from 'react';
import PostPage from './Views/PostPage';
import Search from './Components/Search';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/post/:post">
            <PostPage />
          </Route>
          <Route path="/" exact>
            <Search />
          </Route>
          <Route path="/search/:tag">
            <Search />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
