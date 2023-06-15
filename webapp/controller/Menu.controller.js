sap.ui.define([
    "sap/ui/core/mvc/Controller"
],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
    */

    function (Controller) {
        'use strict';

        return Controller.extend("empleado.controller.Menu", {
            onInit: function () {

            },

            //Función  "Crear empleado"
            navToCreateEmployee: function () {
                //Capturo los conjuntos de routers del programa
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Crear", {}, false);
            },

            //Funcion "Ver Empleado"
            navToShowEmployee: function () {
                //Tomo los conjuntos de routers del programa
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //Navego hacia la vista Ver
                oRouter.navTo("Ver", {}, false);

            },

            // Error en el framework :
            onAfterRendering: function () {
                // Error en el framework : Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
                // pero no funciona en la version 1.78. Por tanto, una solución  encontrada es eliminando la propiedad id del componente por jquery
                var genericTileFirmarPedido = this.byId("linkFirmarPedido");
                //Id del dom
                var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
                //Se vacia el id
                jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
            }

        });
    });