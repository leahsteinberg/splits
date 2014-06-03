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
				{'items':[], 'item_name': '', 'item_price': '', 'payment_forms': [{'payment_to': '', 'payment_price': '', 'number': 0}], 'payments': [], 'friends': [], 'roommates': [], 'user': {}, 'search_name': '', 'pay_same': false});
			},
			loadItemsFromServer: function(){
			},
			getMoreFriends: function(nexturl){
				nexturl = nexturl.slice(nexturl.indexOf('/v1'));
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
					that.setState({'friends': data['friends']});
					if(data['nexturl']){
						that.getMoreFriends(data['nexturl']);
					}
						
				});
				});
			},
			handlePaymentSubmit: function(e){
				e.preventDefault();
				for(var i= 0; i< this.state.payment_forms.length; i++){
					this.state.payments.push({'payment_to': this.state.payment_forms[i]['payment_to'], 'payment_price': this.state.payment_forms[i]['payment_price'], 'payment_from': this.state.user});
				}
				this.setState({'payment_forms': [{'payment_to': '', 'payment_price': '', 'number': 0}]})
			},
			handleItemSubmit: function(e){
				e.preventDefault();
				var who_owns = [];

				for(var i =0; i<this.state.roommates.length; i++){
					who_owns.push({'person': this.state.roommates[i], 'percent_owned': (1/(this.state.roommates.length+1))*100, 'percent_paid': 0});
				}
				who_owns.push({'person': this.state.user, 'percent_owned': (1/(this.state.roommates.length+1))*100, percent_paid: 100})				
				this.state.items.push({'item_name': this.state.item_name, 'price': this.state.item_price, 'people':who_owns});
				this.setState({'item_name': ''});
				this.setState({'item_price': ''});
			},
			handleChange: function(name, number, e){
				e.preventDefault();
				if(name === 'item_name'){
					this.setState({'item_name': e.target.value});
				}
				else if(name === 'item_price'){
					this.setState({'item_price': e.target.value});
				}
				else if(name === 'payment_price'){
					for(var i =0; i< this.state.payment_forms.length; i++){
						if(this.state.payment_forms[i]['number'] === number){
							this.state.payment_forms[i]['payment_price'] = e.target.value;
						}
					}
					this.setState({'payment_forms': this.state.payment_forms});
				}
				console.log("IN HANDLE CHANGE , item name, ", this.state.item_name, "item_price", this.state.item_price);
			},
			selectAsRoommate: function(name, e){
				console.log("in select AS roommate: name is: ", name, "e is: ", e);

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
				for(var i = 0; i< this.state.payment_forms.length; i++){
					if(this.state.payment_forms[i]['number'] === name.props.number){
						this.state.payment_forms[i]['payment_to'] = {'display_name': name.props.display_name, 'id': name.props.id};
					}
				}
				this.setState({'payment_forms': this.state.payment_forms});		
			},
			onSearchInput: function(e){
				this.setState({'search_name': e.target.value});

			},
			addPaymentPerson: function(e){
				e.preventDefault();
				console.log("number peopel is: ", this.state);
				new_number = this.state.payment_forms.length;
				this.state.payment_forms.push({'payment_to': '', 'payment_price': '', 'number': new_number});
				this.setState({'payment_forms': this.state.payment_forms});
			},
			render: function(){
				return (<div>
						<div id="sideBar">
						<PeopleInfo items={this.state.items}  payments={this.state.payments} roommates={this.state.roommates}/>
						<ItemsInfo items={this.state.items}/> </div>
						<UserModule friends={this.state.friends} user={this.state.user_name} roommates={this.state.roommates}  selectAsRoommate={this.selectAsRoommate} />
						<newPayment addPaymentPerson={this.addPaymentPerson} roommates={this.state.roommates} payment_forms={this.state.payment_forms} selectRoommate={this.selectRoommate} onChange={this.handleChange} handlePaymentSubmit={this.handlePaymentSubmit} />
						<newItem handleItemSubmit={this.handleItemSubmit} item_name={this.state.item_name} item_price={this.state.item_price} onChange={this.handleChange} />
						</div>);
			}
		});

		var ItemsInfo = React.createClass({
			render: function(){
				var items = this.props.items.map(function(item){
					return (<Item item_name={item['item_name']}  price={item['price']}/>);
				});
				return (<div id="itemsInfo"><p class="bold">Heres the items:</p>{items}</div>);
			}
		});

		var Item = React.createClass({
			render: function(){
					return(<div>{this.props.item_name}, ${this.props.price}</div>);
			}
		});
		

		var newItem = React.createClass({
			render: function(){
				return (<div id="newItem" >
					<form onSubmit={this.props.handleItemSubmit}> I bought
						<input type ="text"  value={this.props.item_name} 
						onChange={this.props.onChange.bind(this, 'item_name', 0)}>
						for this much: </input>
						<input type ="text" value={this.props.item_price} onChange={this.props.onChange.bind(this,'item_price', 0)}></input>
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
				return (<div id="peopleInfo"><p class="bold">Roommates:</p>{peopleComponents}</div>);
			}
		});


		var PersonInfo = React.createClass({
			render: function(){
				return (<div id="personInfo" >{this.props.display_name}, ${this.props.balance}</div>);
			}
		});

		var getBalance = function(person, items, payments){
			console.log("in GET BALANCE: items ", items);
			var balance=0;
			for(var i=0; i< items.length; i++){
				for(var j =0; j< items[i]['people'].length; j++){
					if(person['id'] === items[i]['people'][j]['person']['id']){
						balance-=(items[i].people[j].percent_owned/100)*items[i].price;
						balance+=(items[i].people[j].percent_paid/100)*items[i].price;
					}
				}
			}
			var payment_balance =0;
			for(var i =0; i<payments.length; i++){
				if(person['display_name'] === payments[i].payment_to['display_name']){
					console.log(payments[i]);
					balance+=parseInt(payments[i]['payment_price']);
				}
				else if(person === payments[i]['payment_from']){
					balance-=payments[i]['payment_price'];

				}
			}
			return balance;
		};


		var newPayment = React.createClass({
			render: function(){
				var that = this;
				people_to_pay = this.props.payment_forms.map(function(payment){
					return (<payPerson number={payment.number} roommates={that.props.roommates} payment_to={payment.payment_to} selectRoommate={that.props.selectRoommate} payment_price={payment.payment_price} onChange={that.props.onChange} select_multiple={that.props.select_multiple}/>);
				});
				//for(var i = 0; i< this.state.number_people; i++){
				//	people_to_pay.push(<payPerson key={i} roommates={this.props.roommates} payment_to={this.props.payment_to} selectRoommate={this.props.selectRoommate} payment_price={this.props.payment_price} onChange={this.props.onChange}/>);
				//}
				return (<div>
					{people_to_pay}
					<form onSubmit={this.props.handlePaymentSubmit}>
					<button>new payment</button>
					<button type="button" onClick={this.props.addPaymentPerson}>pay another person</button>
					</form>
				</div>);
			}
		});
		var payPerson = React.createClass({
			getInitialState: function(){
				return {filter_text: ''};
			},
			onSearchInput: function(e){
				this.setState({'filter_text': e.target.value});
				e.preventDefault();
			},
			render: function(){
				return(<div> 
					<p>pick a roommate to pay:</p>
				<SearchBar filter_text={this.state.filter_text} onChange={this.onSearchInput}/>
				<SelectPeople whole_list={this.props.roommates} select_list={this.props.payment_to} filter_text={this.state.filter_text} onSelect={this.props.selectRoommate} number={this.props.number}/>
				I paid
				<input type ="text" value={this.props.payment_price} onChange={this.props.onChange.bind(this, 'payment_price', this.props.number)}></input>
					</div>)
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
					<p>select roommates:</p>
				<SearchBar filter_text={this.state.filter_text} onChange={this.onSearchInput}/>
				<SelectPeople  whole_list={this.props.friends} select_list={this.props.roommates} onSelect={this.props.selectAsRoommate} filter_text={this.state.filter_text}  number={null}/>
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
						return (<PersonToSelect number={that.props.number_people} id={person['id']} display_name={person['display_name']} onSelect={that.props.onSelect} is_selected={true}/>);
					}
					else{
						return (<PersonToSelect  number={that.props.number}  id={person['id']} display_name={person['display_name']} onSelect={that.props.onSelect}  is_selected={false}/>);
					}
				});
				return (<div id="selectPeopleDiv"><select multiple size="10" id="selectPeopleSelect">{people}</select></div>);	
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
					backgroundColor: '#13A3A5'
					}
				}
				else{
				var divStyle = {
					backgroundColor: '#FFFFFF'

				};
				}
				return (<option style={divStyle} onClick={this.props.onSelect.bind(this.props, this)} value={this.props.display_name}>{this.props.display_name}</option>);
			}
		});

	React.renderComponent(<SplitsiesModule/>, document.getElementById("anchor"));





