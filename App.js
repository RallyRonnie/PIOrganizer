Ext.define('BLBoard', {
	extend: 'Rally.app.App',
	componentCls: 'app',
	launch: function() {

		var ppicker = null;
		var cardBoardConfig = null;
		var addNewConfig = null;
		var pcolumns = '[';
		var cproj = this.getContext().getProject().ObjectID;
		var cname = this.getContext().getProject().Name;
//	console.log(cproj + cname);
		var pcolumn = "{ value: '/project/" + this.getContext().getProject().ObjectID + "', columnHeaderConfig: { headerTpl: '{project}', headerData: { project: '" + this.getContext().getProject().Name + "' } } }";
		pcolumns = pcolumns + pcolumn + ",";
		var pc = Ext.create('Rally.data.WsapiDataStore', {
			autoLoad: true,
			fetch: [ 'Name', 'ObjectID' ],
			filters: [
				{ property: 'Parent.ObjectID', value: '__PROJECT_OID__' }
			],
			model: 'Project',
			listeners: {
				load: function(store, data) {
					Ext.Array.each(data, function(child) {
//	console.log(child.get('Name')); //Logs the child name
						pcolumn = "{ value: '/project/" + child.get('ObjectID') + "', columnHeaderConfig: { headerTpl: '{project}', headerData: { project: '" + child.get('Name') + "' } } }";
						pcolumns = pcolumns + pcolumn + ",";
					});
					pcolumns = pcolumns.substring(0, pcolumns.length - 1) + "]";
					typeComboBox = this.add({
					xtype: 'rallyportfolioitemtypecombobox',
					listeners:{
						change: function(combobox){
// console.log(typeComboBox.getRecord());
							piType = typeComboBox.getRecord().get('TypePath');
							var piFields = ['PercentDoneByStoryPlanEstimate', 'Parent', 'Discussion'];
							if (typeComboBox.getRecord().get('Ordinal') === 0) piFields.push('UserStories');
							this._doBoard(piType, pcolumns, piFields);
						},
						scope: this
					}
				});
				},
				scope: this
			}
		});
	},
	_doBoard: function (pitype, pcolumns, piFields) {
		if ( this.piBoard ) { this.piBoard.destroy(); }
		if ( this.addNew ) { this.addNew.destroy(); }
		this.addNew = this.add({
			xtype: 'rallyaddnew',
			recordTypes: [pitype],
			ignoredRequiredFields: ['Name', 'Project'],
			listeners: {
				create: function(addNew, record) {
//	Ext.Msg.alert('Add New', 'Added record named ' + record.get('Name'));
				}
			},
			showAddWithDetails: true
		});
		this.piBoard = this.add({
			xtype: 'rallycardboard',
			types: [pitype],
			attribute: 'Project',
			columns: eval(pcolumns),
				cardConfig: {
					fields: piFields,
					editable: true,
					showIconMenus: true,
					showBlockedReason: true
				},
			storeConfig: {
				filters: [
//					{ property: 'ScheduleState', operator: '<', value: 'In-Progress' },
//					{ property: 'kanbanState', operator: '!=', value: 'Done' }
				],
				sorters: [
					{ property: 'Rank', direction: 'ASC' }
				]
			}
		});
	}
});