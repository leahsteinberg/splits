		/** @jsx React.DOM */
		var socket = io.connect();
		var increment=1;

		var getBalance = function(person, items, payments){
			var person_owns=0;
			var person_paid = 0;
			for(var i=0; i< items.length; i++){
				for(var j =0; j< items[i].people.length; j++){
					if(person === items[i].people[j].person_name){
						person_owns+=(items[i].people[j].percent_owned/100)*items[i].price;
						person_paid+=(items[i].people[j].percent_paid/100)*items[i].price;
					}
			}
			}
			var payment_balance =0;
			for(var i =0; i<payments.length; i++){
				console.log(payments);
				if(person === payments[i].payment_to){
					console.log(payments[i].price);
					payment_balance+=parseInt(payments[i].price);
					console.log("pb to, ", payment_balance, person);

				}
				else if(person === payments[i].payment_from){
					payment_balance-=payments[i].price;
					console.log("pb from, ", payment_balance, person);

				}
			}
			return person_owns-person_paid+payment_balance;
		};

		var getPeople = function(items){
		console.log("in get people");
			var peopleSet = {};
			for(var i = 0; i< items.length; i++){
				for(var j = 0; j< items[i]['people'].length; j++){
					var person = items[i]['people'][j]['person_name'];
					if(peopleSet[person]=== undefined){
						peopleSet[person] = 'here';
					}
				}
			}
			peopleArray = []
			for(personString in peopleSet){
				if(peopleSet.hasOwnProperty(personString)){
					peopleArray.push(personString);
				}
			}
			return peopleArray;
		}


		var UserModule = React.createClass({
			componentWillMount: function(){
				console.log("user module props", this.props);
				this.setState({'filter_text': ''});
			},
			onInput: function(e){
				this.setState({'filter_text': e.target.value});
			},
			render: function(){
				return(<div>{this.props.user_name}
					<p>Type to search friends, to select roommates:</p>
				<SearchBar filter_text={this.state.filter_text} onChange={this.onInput}/>
				<SelectPeople whole_list={this.props.friends} select_list={this.props.roommates} onSelect={this.props.onSelect} filter_text={this.state.filter_text} max_people={15}/>
				</div>);
			}
		});

		var SelectPeople = React.createClass({
			render: function(){
				console.log("select people props", this.props);
				var that = this;
				var filtered_people = [];
				if(this.props.filter_text !== ''){
				console.log("in select people whole list, ", this.props.whole_list);
				this.props.whole_list.map(function(person){
					if(person['display_name']){
					var lower_display_name = person['display_name'].toLowerCase();
					}
					else{
						var lower_display_name = person.toLowerCase();
					}
					console.log(person);
					console.log(that.props.filter_text);
					var lower_filter_text = that.props.filter_text.toLowerCase();
				if(lower_display_name.indexOf(lower_filter_text) !== -1){

						filtered_people.push(person);
						console.log("filtered people is, ", filtered_people);
					}
				});
				}
				people = filtered_people.map(function(person){
					console.log("that props select list", that.props.select_list);
					if(that.props.select_list.indexOf(person['display_name'])!= -1){
						return (<PersonToSelect user_name={person['user_id']} display_name={person['display_name']} onSelect={that.props.onSelect} is_selected={true}/>);
					}
					else{
						return (<PersonToSelect user_name={person['user_id']} display_name={person['display_name']} onSelect={that.props.onSelect}  is_selected={false}/>);
					}
				});
				return (<div>{people}</div>);	
			}
		});

		var SearchBar = React.createClass({
			render: function(){
				return (
					<div>
				<form onChange={this.props.onChange} > 
						<input type ="text"  value={this.props.filter_text}> </input>
					</form>
					</div>
				);
			}
		});



		var PersonToSelect = React.createClass({
			render: function(){
				if(this.props.is_selected){
					var divStyle = {
				backgroundColor: '#86E2D5'
				}
				}
				else{
				var divStyle = {
					backgroundColor: '#C5EFF7'
				};

				}
				return (<div style={divStyle} onClick={this.props.onSelect.bind(this, this.props)}>{this.props.display_name}</div>);
			}
		});


		var SplitsiesModule = React.createClass({
			getInitialState: function(){
				return (
				{'items':[
					{'key': 0, 'item_name': 'peanut butter', 'price': 30, 'people':[
							{'key': 0, 'person_name': 'Sarah', 'percent_owned': 50, 'percent_paid': 100},
							{'key': 1, 'person_name': 'Rachel', 'percent_owned': 50, 'percent_paid':0}
							]}],
							'item_name': '', 'item_price': '', 'payment_to': [], 'payment_price': '', 'payments': [], 'friends': [], 'roommates': []
					});
			},
			loadItemsFromServer: function(){
				var that = this;
				socket.on('message', function(data){
				});
			},
			componentWillMount: function(){
				var that = this;
				$.ajax({
					type: "GET",
					url: '/venmo_user',
					dataType: 'json'
				}).done(function(data) {
					console.log("got from venmo user", data);
					that.setState({'user_name': data['data']['user']['username'], 'user_id': data['data']['user']['id']});
					var formData = {
						'user_id': that.state.user_id};
					$.ajax({
						type: "GET",
						data: formData,
						url: '/venmo_user_friends',
						dataType: 'json'
					}).done(function(data) {
						that.setState({'friends': data['friends']});
						
					});
				});
			},
			handlePaymentSubmit: function(e){
				increment+=1;
				this.state.payments.push({'key': increment, 'payment_to': this.state.payment_to[0], 'price': this.state.payment_price, 'payment_from': 'Rachel'});
				this.setState({'payment_to': []});
				this.setState({'payment_price': ''});
				e.preventDefault();
			},
			handleItemSubmit: function(e){
				increment+=1;
				this.state.items.push({'key': increment, 'item_name': this.state.item_name, 'price': this.state.item_price
				, 'people':[
							{'key': 0, 'person_name': 'Sarah', 'percent_owned': 50, 'percent_paid': 100},
							{'key': 1, 'person_name': 'Rachel', 'percent_owned': 50, 'percent_paid':0}
							]});
				this.setState({'item_name': ''});
				this.setState({'item_price': ''});
				e.preventDefault();
			},
			handleChange: function(name, e){
				if(name === 'item_name'){
					this.setState({'item_name': e.target.value});
				}
				else if(name === 'item_price'){
					this.setState({'item_price': e.target.value});
				}
				else if(name === 'payment_to'){
					this.setState({'payment_to': [e.target.value]});
				}
				else if(name === 'payment_price'){
					this.setState({'payment_price': e.target.value});
				}
			},
			selectPerson: function(name, e){
				console.log("in select person", name);
				if(this.state.roommates.indexOf(name['display_name'])!= -1){
					var array_index = this.state.roommates.indexOf(name);
					console.log("array index is", array_index);
					this.state.roommates.splice(array_index, 1);

					}
					else{
				this.state.roommates.push(name);
				}
				this.setState({'roommates': this.state.roommates});
				e.preventDefault();

			},
			selectRoommate: function(name, e){
				console.log("in select roommate for payment!!!!");
				if(this.state.payment_to !== ''){
					this.setState({'payment_to': [name]});
				}
				else if(this.state.payment_to === name){
					this.setState({'payment_to': []});
				}
				e.preventDefault();

			},
			render: function(){
				return (<div>
						<UserModule friends={this.state.friends} user_name={this.state.user_name} roommates={this.state.roommates}  onSelect={this.selectPerson}/>
						<Items info={this.state}/>
						<PeopleInfo info={this.state}/>
						<newItem handleItemSubmit={this.handleItemSubmit} onChange={this.handleChange}
						item_name={this.state.item_name} item_price={this.state.item_price}/>
						<newPayment roommates={this.state.roommates} handlePaymentSubmit={this.handlePaymentSubmit} onChange={this.handleChange}  payment_to={this.state.payment_to} payment_price={this.state.payment_price} onSelect={this.selectRoommate}/>
						</div>);
			}
		});
			
		var Items = React.createClass({
			render: function(){
				var items = this.props.info.items.map(function(item){
					return (<Item item_name={item.item_name}  price={item.price}/>);
				});
				return (<div><p>Heres the items:</p>{items}</div>);
			}
		});

		var Item = React.createClass({
			render: function(){
					return(<div>{this.props.item_name}, ${this.props.price}</div>);
			}
		});

		var PeopleInfo = React.createClass({
			render: function(){
				var people_set = [];
				var items = this.props.info.items;
				var payments = this.props.info.payments;
				var peopleSet = getPeople(items);
				var peopleComponents = peopleSet.map(function(person){
					var balance = getBalance(person, items, payments);
					return (<PersonInfo person_name={person} balance={balance}/>);
				});
				return (<div><p>Heres the people:</p>{peopleComponents}</div>);
			}
		});


		var PersonInfo = React.createClass({
			render: function(){
				return (<div>{this.props.person_name}, ${this.props.balance}</div>);
			}
		});

		var newItem = React.createClass({
			render: function(){
				return (<div>
					<form onSubmit={this.props.handleItemSubmit}> I bought
						<input type ="text"  value={this.props.item_name} 
						onChange={this.props.onChange.bind(this, 'item_name')}>
						for this much: </input>
						<input type ="text" value={this.props.item_price} onChange={this.props.onChange.bind(this, 'item_price')}></input>
						<button>new item</button>
					</form>
				</div>);
			}
		});




		var newPayment = React.createClass({
			getInitialState: function(){
				console.log("new payment props, ", this.props);
				return {filter_text: ''};

			},
			onInput: function(e){
				console.log("on input", e.target.value);
				this.setState({'filter_text': e.target.value});
				console.log(this.state);
				e.preventDefault();
			},
			render: function(){
				return (<div>
					<SearchBar filter_text={this.state.filter_text}  onChange={this.onInput} />
					<SelectPeople whole_list={this.props.roommates} select_list={this.props.payment_to} onSelect={this.props.SelectRoommate} max_number={1} filter_text={this.state.filter_text}/>
									<form onSubmit={this.props.handlePaymentSubmit}> I paid
					<input type ="text" value={this.props.payment_price} onChange={this.props.onChange.bind(this, 'payment_price')}></input>
					<button>new payment</button>
					</form>
				</div>);
			}
		});
		
		React.renderComponent(<SplitsiesModule/>, document.getElementById("anchor"));

