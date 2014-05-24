	/** @jsx React.DOM */



	var objInObjList = function(obj, list, field){
		for(var i = 0; i< list.length; i++){
			if(list[i][field] === obj[field]){
				return i;
			}
		}
		return -1;
	};

	var SplitsiesModule = React.createClass({
			getInitialState: function(){
				return (
				{'items':[], 'item_name': '', 'item_price': '', 'payment_to': [], 'payment_price': '', 'payments': [], 'friends': [], 'roommates': [], 'user': {}, 'search_name': ''
					});
			},
			loadItemsFromServer: function(){
			},
			getMoreFriends: function(nexturl){
				console.log("next url is,",  nexturl);

				nexturl = nexturl.slice(nexturl.indexOf('/v1'));
				console.log("next url2 is,",  nexturl);
				var that = this;
				var formData = {
					'nexturl': nexturl,
					'id': that.state['user']['id']
				};
				$.ajax({
					type: "GET",
					data: formData,
					url: '/venmo_more',
					dataType: 'json'
				}).done(function(data) {
					that.state.friends.push.apply(that.state.friends, data['friends']);
					that.setState({'friends': that.state.friends});
					console.log(that.state);
					if(data['nexturl']){
						that.getMoreFriends(data['nexturl']);
					}	
				});
			},
			componentWillMount: function(){
				var that = this;
				$.ajax({
					type: "GET",
					url: '/venmo_user',
					dataType: 'json'
				}).done(function(data) {
					that.setState({'user': {'display_name': data['data']['user']['display_name'], 'id': data['data']['user']['id']}});
					var formData = {
						'id': that.state['user']['id']};
				$.ajax({
					type: "GET",
					data: formData,
					url: '/venmo_user_friends',
					dataType: 'json'
				}).done(function(data) {
					console.log("data is", data);
					that.setState({'friends': data['friends']});
					if(data['nexturl']){
						that.getMoreFriends(data['nexturl']);
					}
						
				});
				});
			},
			handlePaymentSubmit: function(e){
				if(this.state.payment_to.length > 0 && !isNaN(this.state.payment_price)){
					this.state.payments.push({'payment_to': this.state.payment_to[0], 'price': this.state.payment_price, 'payment_from': this.state.user});
					this.setState({'payment_to': []});
					this.setState({'payment_price': ''});
				}
				e.preventDefault();
				
			},
			handleItemSubmit: function(e){
				e.preventDefault();
				var who_owns = [];
				console.log(this);
				console.log("rooomates", this.state.roommates);
				for(var i =0; i<this.state.roommates.length; i++){
					console.log("handle item submit in for loop");
					console.log(this.state.roommates[i]);
					who_owns.push({'person': this.state.roommates[i], 'percent_owned': (1/(this.state.roommates.length+1))*100, 'percent_paid': 0});
				}
				who_owns.push({'person': this.state.user, 'percent_owned': (1/(this.state.roommates.length+1))*100, percent_paid: 100})
				console.log(who_owns);
				
				this.state.items.push({'item_name': this.state.item_name, 'price': this.state.item_price, 'people':who_owns});
				this.setState({'item_name': ''});
				this.setState({'item_price': ''});
				//e.preventDefault();

			},
			handleChange: function(name, e){
				if(name === 'item_name'){
					this.setState({'item_name': e.target.value});
				}
				else if(name === 'item_price'){
					this.setState({'item_price': e.target.value});
				}
				else if(name === 'payment_price'){
					this.setState({'payment_price': e.target.value});
				}
			},
			selectAsRoommate: function(name, e){
				var indexInRoommates = objInObjList(name.props, this.state.roommates, 'id');
				if(indexInRoommates !== -1){
					this.state.roommates.splice(indexInRoommates, 1);
				}
				else{
					this.state.roommates.push(name.props);
				}
				this.setState({'roommates': this.state.roommates});
				e.preventDefault();

			},
			selectRoommate: function(name, e){
				if(this.state['payment_to'].length> 0){
					this.state.payment_to.splice(0,1);
				}
				this.state.payment_to.push(name.props);
				this.setState({'payment_to': this.state.payment_to});		
			},
			onSearchInput: function(e){
				this.setState({'search_name': e.target.value});

			},
			render: function(){
				return (<div>
						<UserModule friends={this.state.friends} user={this.state.user_name} roommates={this.state.roommates}  selectAsRoommate={this.selectAsRoommate}/>
						<newPayment roommates={this.state.roommates} payment_to={this.state.payment_to} selectRoommate={this.selectRoommate} payment_price={this.state.payment_price} onChange={this.handleChange} handlePaymentSubmit={this.handlePaymentSubmit}/>
						<newItem handleItemSubmit={this.handleItemSubmit} item_name={this.state.item_name} item_price={this.state.item_price} onChange={this.handleChange} />
						<PeopleInfo items={this.state.items}  payments={this.state.payments} roommates={this.state.roommates}/>
						<ItemsInfo items={this.state.items}/>
						</div>);
			}
		});

		var ItemsInfo = React.createClass({
			render: function(){
				var items = this.props.items.map(function(item){
					return (<Item item_name={item['item_name']}  price={item['price']}/>);
				});
				return (<div><p>Heres the items:</p>{items}</div>);
			}
		});

		var Item = React.createClass({
			render: function(){
					return(<div>{this.props.item_name}, ${this.props.price}</div>);
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



		var PeopleInfo = React.createClass({
			render: function(){
				var items = this.props.items;
				var payments = this.props.payments;
				var peopleComponents = this.props.roommates.map(function(person){
					var balance = getBalance(person, items, payments);
					return (<PersonInfo display_name={person['display_name']} balance={balance}/>);
				});
				return (<div><p>Heres the people:</p>{peopleComponents}</div>);
			}
		});


		var PersonInfo = React.createClass({
			render: function(){
				return (<div>{this.props.display_name}, ${this.props.balance}</div>);
			}
		});



		var getBalance = function(person, items, payments){
			var balance=0;
			console.log("items in get balance,", items);
			for(var i=0; i< items.length; i++){
				for(var j =0; j< items[i]['people'].length; j++){
					if(person['id'] === items[i]['people'][j]['person']['id']){
						console.log("percent owned ", items[i]['people'][j].percent_owned);
						balance-=(items[i].people[j].percent_owned/100)*items[i].price;
						balance+=(items[i].people[j].percent_paid/100)*items[i].price;
					}
				}
			}
			var payment_balance =0;
			for(var i =0; i<payments.length; i++){
				if(person['display_name'] === payments[i].payment_to['display_name']){
					balance+=parseInt(payments[i]['price']);
				}
				else if(person === payments[i]['payment_from']){
					balance-=payments[i]['price'];

				}
			}
			return balance;
		};









		var newPayment = React.createClass({
			getInitialState: function(){
				return {filter_text: ''};

			},
			onSearchInput: function(e){
				this.setState({'filter_text': e.target.value});
				e.preventDefault();
			},
			render: function(){
				return (<div>
						<p>Type to pick a roommate to pay:</p>
						<SearchBar filter_text={this.state.filter_text} onChange={this.onSearchInput} />
						<SelectPeople whole_list={this.props.roommates} select_list={this.props.payment_to} onSelect={this.selectRoommate} filter_text={this.state.filter_text} onSelect={this.props.selectRoommate}/>
						 I paid
						 <form onSubmit={this.props.handlePaymentSubmit}>
					<input type ="text" value={this.props.payment_price} onChange={this.props.onChange.bind(this, 'payment_price')}></input>
					<button>new payment</button>
					</form>
				</div>);
			}
		});


		var UserModule = React.createClass({
			componentWillMount: function(){
				this.setState({'filter_text': ''});
			},
			onSearchInput: function(e){
				this.setState({'filter_text': e.target.value});
			},
			render: function(){
				return(<div>{this.props.user_name}
					<p>Type to search friends, to select roommates:</p>
				<SearchBar filter_text={this.state.filter_text} onChange={this.onSearchInput}/>
				<SelectPeople whole_list={this.props.friends} select_list={this.props.roommates} onSelect={this.props.selectAsRoommate} filter_text={this.state.filter_text}  />

				</div>);
			}
		});

		var SelectPeople = React.createClass({
			render: function(){
				var that = this;
				var filtered_people = [];
				if(this.props.filter_text !== ''){
					this.props.whole_list.map(function(person){
						var lower_display_name = person['display_name'].toLowerCase();
						var lower_filter_text = that.props.filter_text.toLowerCase();
						if(lower_display_name.indexOf(lower_filter_text) !== -1){
							filtered_people.push(person);
						}
					});
				}
				people = filtered_people.map(function(person){
					if(objInObjList(person, that.props.select_list, 'id') !== -1){
						return (<PersonToSelect id={person['id']} display_name={person['display_name']} onSelect={that.props.onSelect} is_selected={true}/>);
					}
					else{
						return (<PersonToSelect id={person['id']} display_name={person['display_name']} onSelect={that.props.onSelect}  is_selected={false}/>);
					}
				});
				return (<div>{people}</div>);	
			}
		});

		var SearchBar = React.createClass({
			render: function(){

				return (<div>
						<form  > 
							<input type ="text"  onChange={this.props.onChange} value={this.props.filter_text}> </input>
						</form>
					</div>);
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
				return (<div style={divStyle} onClick={this.props.onSelect.bind(this.props, this)} value={this.props.display_name}>{this.props.display_name}</div>);
			}
		});

	React.renderComponent(<SplitsiesModule/>, document.getElementById("anchor"));





