sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/Router"
], 

     /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
	 * @param {typeof sap.ui.core.routing.History} History
	 * @param {typeof sap.ui.model.Filter} Filter
	 * @param {typeof sap.ui.model.FilterOperator} FilterOperator
	 * @param {typeof sap.ui.core.routing.Router} Router
     */

function (Controller,History,Filter,FilterOperator,Router) {
	"use strict";
	
	return Controller.extend("empleado.controller.Ver", {

	 onInit: function (){

		this._split = this.byId("splitAppEmployee");
        this._sapId = this.getOwnerComponent().sapId;	
		//this._splitAppEmployee = this.byId("splitAppEmployee");
	},
	onBeforeRendering: function(){
		this._i18n = this.getView().getModel("i18n").getResourceBundle();
	},	
	
	//Función al pulsar "<" para regresar al menú
	onPressBack: function (){
			// vamos al menu
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Menu", {}, true);
	},
	
	//Función para filtrar empleados
	 onSearchEmployee: function (oEvent){
		var sQuery = oEvent.getSource().getValue();
		var aFilters = [];

		if (sQuery && sQuery.length > 0){
			var filter = new Filter({
				filters: [
					new Filter("FirstName", FilterOperator.Contains, sQuery),
					new Filter("LastName", FilterOperator.Contains, sQuery)
				],
				and: false
			});
			aFilters.push(filter);
		} 

	var oList = this.getView().byId("listItem");
	var oBinding = oList.getBinding("items");
	oBinding.filter(aFilters, "Application");  
},
	
	//Función al seleccionar un empleado
	onSelectEmployee: function (oEvent){
		//Se navega al detalle del empleado
		this._splitAppEmployee.to(this.createId("detailEmployee"));
		var context = oEvent.getParameter("listItem").getBindingContext("odataModel");
		//Se almacena el usuario seleccionado
		this.employeeId = context.getProperty("EmployeeId");
		var detailEmployee = this.byId("detailEmployee");
		//Se bindea a la vista con la entidad Users y las claves del id del empleado y el id del alumno
		detailEmployee.bindElement("odataModel>/Users(EmployeeId='"+ this.employeeId +"',SapId='"+this.getOwnerComponent().SapId+"')");
		
	},
	
	//Función para eliminar el empleado seleccionado
	onDeleteEmployee: function (oEvent){
		//Se muestra un mensaje de confirmación
		sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("estaSeguroEliminar"),{
			title : this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
			onClose : function(oAction){
			    	if(oAction === "OK"){
			    		//Se llama a la función remove
						this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='"+this.getOwnerComponent().SapId+"')",{
							success : function(data){
								sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("seHaEliminadoUsuario"));
								//En el detalle se muestra el mensaje "Seleecione empleado"
								this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
							}.bind(this),
							error : function(e){
								sap.base.Log.info(e);
							}.bind(this)
						});
			    	}
			}.bind(this)
		});
	},
	
	//Función para ascender a un empleado
	onRiseEmployee: function (oEvent){
		if(!this.riseDialog){
            //this.riseDialog = sap.ui.xmlfragment("logaligroup/rrhh/fragment/RiseEmployee", this);
			this.riseDialog = sap.ui.xmlfragment("empleado/fragment/RiseEmployee", this);
			this.getView().addDependent(this.riseDialog);
		}
		this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}),"newRise");
		this.riseDialog.open();
	},
	
	//Función para cerrar el dialogo
	 onCloseRiseDialog: function (){
		this.riseDialog.close();
	},
	
	//Función para crear un nuevo ascenso
	addRise: function (oEvent){
		//Se obtiene el modelo newRise
		var newRise = this.riseDialog.getModel("newRise");
		//Se obtiene los datos
		var odata = newRise.getData();
		//Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del alumno y el id del empleado
		var body = {
			Amount : odata.Amount,
			CreationDate : odata.CreationDate,
			Comments : odata.Comments,
			SapId : this.getOwnerComponent().SapId,
			EmployeeId : this.employeeId
		};
		this.getView().setBusy(true);
		this.getView().getModel("odataModel").create("/Salaries",body,{
			success : function(){
				this.getView().setBusy(false);
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrectamente"));
				this.onCloseRiseDialog();
			}.bind(this),
			error : function(){
                this.getView().setBusy(false);
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
			}.bind(this)
		});
		
    },
    
    //Función que se ejecuta al cargar un fichero en el uploadCollection
	//Se agrega el parametro de cabecera x-csrf-token con el valor del token del modelo
	//Es necesario para validarse contra sap
	onChange: function (oEvent) {
	   var oUploadCollection = oEvent.getSource();
	   // Header Token
	   var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
	    name: "x-csrf-token",
	    value: this.getView().getModel("odataModel").getSecurityToken()
	   });
	   oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
	 },
	
	//Función que se ejecuta por cada fichero que se va a subir a sap
	//Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
	  onBeforeUploadStart: function (oEvent) {
	   var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.employeeId+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      },
    
       onUploadComplete: function (oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
    },

     onFileDeleted: function (oEvent){
        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();
        this.getView().getModel("odataModel").remove(sPath, {
            success: function(){
                oUploadCollection.getBinding("items").refresh();
            },
            error: function(){

            }
        });
    },

     downloadFile: function (oEvent){
        var sPath = oEvent.getSource().getBindingContext("odataModel").getPath();
        window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
    }
	});

});