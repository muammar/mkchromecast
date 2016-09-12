var HelloMessage = React.createClass({
// borrowed from react documentation
render: function() {
  // render
        return <div>Hello {this.props.name}</div>;
}
});

React.render(<HelloMessage name="John" />, mountNode);
