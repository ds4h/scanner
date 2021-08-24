import "./App.css";
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Nav from "./Nav";
import Nodes from "./Nodes";
import AddNode from "./AddNode";
import Validate from "./Validate";

class App extends Component {
    render() {
        return (
            <Router>
                <div class="">
                    <Nav />
                    <Switch>
                        <Route path="/" exact component={Nodes} />
                        <Route path="/AddNode" component={AddNode} />
                        <Route path="/Validate" component={Validate} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
