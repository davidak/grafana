define([
  'features/dashboard/dynamicDashboardSrv',
  'features/dashboard/dashboardSrv'
], function() {
  'use strict';

  function dynamicDashScenario(desc, func)  {

    describe(desc, function() {
      var ctx = {};

      ctx.setup = function (setupFunc) {

        beforeEach(module('grafana.services'));

        beforeEach(inject(function(dynamicDashboardSrv, dashboardSrv) {
          ctx.dynamicDashboardSrv = dynamicDashboardSrv;
          ctx.dashboardSrv = dashboardSrv;

          var model = {
            rows: [],
            templating: { list: [] }
          };

          setupFunc(model);
          ctx.dash = ctx.dashboardSrv.create(model);
          ctx.dynamicDashboardSrv.init(ctx.dash);
          ctx.rows = ctx.dash.rows;

        }));

      };

      func(ctx);

    });
  }

  dynamicDashScenario('given dashboard with panel repeat', function(ctx) {
    ctx.setup(function(dash) {
      dash.rows.push({
        panels: [{id: 2, repeat: '$apps'}]
      });
      dash.templating.list.push({
        name: 'apps',
        current: {
          text: 'se1, se2',
          value: ['se1', 'se2']
        },
        options: [
          {text: 'se1', value: 'se1', selected: true},
          {text: 'se2', value: 'se2', selected: true},
        ]
      });
    });

    it('should repeat panel one time', function() {
      expect(ctx.rows[0].panels.length).to.be(2);
    });

    it('should mark panel repeated', function() {
      expect(ctx.rows[0].panels[0].linked).to.be(undefined);
      expect(ctx.rows[0].panels[0].repeat).to.be('$apps');
      expect(ctx.rows[0].panels[1].linked).to.be(true);
      expect(ctx.rows[0].panels[1].repeat).to.be(null);
    });

    it('should set scopedVars on panels', function() {
      expect(ctx.rows[0].panels[0].scopedVars.apps.value).to.be('se1');
      expect(ctx.rows[0].panels[1].scopedVars.apps.value).to.be('se2');
    });

  });

  dynamicDashScenario('given dashboard with row repeat', function(ctx) {
    ctx.setup(function(dash) {
      dash.rows.push({
        repeat: '$servers',
        panels: [{id: 2}]
      });
      dash.templating.list.push({
        name: 'servers',
        current: {
          text: 'se1, se2',
          value: ['se1', 'se2']
        },
        options: [
          {text: 'se1', value: 'se1', selected: true},
          {text: 'se2', value: 'se2', selected: true},
        ]
      });
    });

    it('should repeat row one time', function() {
      expect(ctx.rows.length).to.be(2);
    });

    it('should keep panel ids on first row', function() {
      expect(ctx.rows[0].panels[0].id).to.be(2);
    });

    it('should mark second row as repeated', function() {
      expect(ctx.rows[0].linked).to.be(undefined);
      expect(ctx.rows[0].repeat).to.be('$servers');
      expect(ctx.rows[1].linked).to.be(true);
      expect(ctx.rows[1].repeat).to.be(null);
    });

    it('should set scopedVars on row panels', function() {
      expect(ctx.rows[0].panels[0].scopedVars.servers.value).to.be('se1');
      expect(ctx.rows[1].panels[0].scopedVars.servers.value).to.be('se2');
    });

  });


});