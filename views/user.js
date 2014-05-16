		
						<UserModule user_name={this.state.user_name}/>


		var UserModule = React.createClass({
			render: function(){
				return(<div>{this.props.user_name}
				<SelectRoommates/>
	
				</div>);
			}
		});

		var SelectRoommates = React.createClass({
			render: function(){
				return (<div><SearchBar/></div>);

			}
		});

		var SearchBar = React.createClass({
			render: function(){
				return (
				<form > 
						<input type ="text"  value={this.props.item_name} 
						onChange={this.props.onChange.bind(this, 'search_person')}> </input>
					</form>
				);
			}
		});

		var PersonSelect = React.createClass({
			render: function(){
				return (<div>{this.props.user_name}</div>);
			}
		});