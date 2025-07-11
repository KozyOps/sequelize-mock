'use strict';

var should = require('should');
var proxyquire = require('proxyquire').noCallThru();

var InstanceMock = function () { this._args = arguments; };
InstanceMock.prototype.save = async function () { return this; };

var UtilsMock = {
	uppercaseFirst: function (str) { return str; },
	singularize: function (str) { return str; },
	pluralize: function (str) { return str; },
};

var QueryInterfaceMock = function () { this._args = arguments; };
QueryInterfaceMock.prototype = {
	$queueResult: function () { },
	$queueFailure: function () { },
	$clearQueue: function () { },
	$query: function (q) { return q; },
};

var Model = proxyquire('../src/model', {
	'./utils': UtilsMock,
	'./instance': InstanceMock,
	'./queryinterface': QueryInterfaceMock,
});

describe('Model', function () {

	describe('__constructor', function () {
		var pluralize;
		beforeEach(function () {
			pluralize = UtilsMock.pluralize;
		});
		afterEach(function () {
			UtilsMock.pluralize = pluralize;
		});

		it('should assign a name to a model', function () {
			var mdl = new Model('foo');
			mdl.name.should.equal('foo');
		});

		it('should accept an object of default values', function () {
			var mdl = new Model('baz', {
				'foo': 'bar',
			});

			mdl.name.should.equal('baz');
			mdl._defaults.should.have.property('foo').which.is.exactly('bar');
		});

		it('should accept default object as first argument', function () {
			var mdl = new Model({
				'foo': 'bar',
			});
			mdl.name.should.equal('');
			mdl._defaults.should.have.property('foo').which.is.exactly('bar');
		});

		it('should have callable Instance property', function () {
			var mdl = new Model('foo'),
				inst = new mdl.Instance('bar');
			inst.should.be.Object();
			inst._args[0].should.equal('bar');
		});

		it('should assign instanceMethods functions to Instance prototype', function () {
			var fooFn = function () { return 'bar'; },
				mdl = new Model('baz', {}, {
					instanceMethods: {
						foo: fooFn,
					},
				});

			mdl.Instance.prototype.should.have.property('foo').which.is.exactly(fooFn);
		});

		it('should have a default set of options assigned', function () {
			var mdl = new Model('foo');
			mdl.options.timestamps.should.be.true();
			mdl.options.instanceMethods.should.be.an.Object();
			mdl.options.classMethods.should.be.an.Object();
			mdl.options.freezeTableName.should.be.false();
			mdl.options.stopPropagation.should.be.false();
			mdl.options.createdDefault.should.be.true();
			mdl.options.autoQueryFallback.should.be.true();
		});

		it('should inherit options from a passed in sequelize object', function () {
			var mdl = new Model('foo', {}, {
				sequelize: {
					getQueryInterface: function () { },
					options: {
						autoQueryFallback: false,
						stopPropagation: true,
						fallbackFn: 'foo',
						bar: 'baz'
					}
				}
			});
			mdl.options.stopPropagation.should.be.true();
			mdl.options.autoQueryFallback.should.be.false();
			mdl.options.fallbackFn.should.equal('foo');
			mdl.options.should.not.have.property('bar');
		});

		it('should save options from passed in object object', function () {
			var mdl = new Model('foo', {}, {
				foo: 'bar'
			});
			mdl.options.should.have.property('foo').which.is.exactly('bar');
		});

		it('should save table name if passed in from options', function () {
			var mdl = new Model('foo', {}, {
				tableName: 'bar',
			});
			mdl.name.should.equal('foo');
			mdl.tableName.should.equal('bar');
		});

		it('should use a "pluralized" table name if no table name is provided', function () {
			UtilsMock.pluralize = function () {
				return 'bar';
			};
			var mdl = new Model('foo');
			mdl.name.should.equal('foo');
			mdl.tableName.should.equal('bar');
		});

		it('should not use a "pluralized" table name if options indicate to freeze table name', function () {
			UtilsMock.pluralize = function () {
				return 'bar';
			};
			var mdl = new Model('foo', {}, {
				freezeTableName: true,
			});
			mdl.name.should.equal('foo');
			mdl.tableName.should.equal('foo');
		});

		it('should return an object with the proper API functions', function () {
			var mdl = new Model('foo');

			// Test API functions
			mdl.should.have.property('$queryInterface').which.is.an.Object();
			mdl.should.have.property('$queueResult').which.is.a.Function();
			mdl.should.have.property('$queueFailure').which.is.a.Function();
			mdl.should.have.property('$queueError').which.is.a.Function();
			mdl.should.have.property('$clearQueue').which.is.a.Function();
			mdl.should.have.property('$queueClear').which.is.a.Function();
			mdl.should.have.property('$query').which.is.a.Function();

			// Not yet supported functions are commented out

			// mdl.should.have.property('removeAttributes').which.is.a.Function();
			mdl.should.have.property('sync').which.is.a.Function();
			// mdl.should.have.property('drop').which.is.a.Function();
			// mdl.should.have.property('schema').which.is.a.Function();
			mdl.should.have.property('getTableName').which.is.a.Function();
			mdl.should.have.property('unscoped').which.is.a.Function();
			mdl.should.have.property('addScope').which.is.a.Function();
			mdl.should.have.property('scope').which.is.a.Function();
			mdl.should.have.property('find').which.is.a.Function();
			mdl.should.have.property('findAll').which.is.a.Function();
			mdl.should.have.property('findAndCount').which.is.a.Function();
			mdl.should.have.property('findAndCountAll').which.is.a.Function();
			mdl.should.have.property('findByPk').which.is.a.Function();
			mdl.should.have.property('findOne').which.is.a.Function();
			// mdl.should.have.property('aggregate').which.is.a.Function();
			// mdl.should.have.property('count').which.is.a.Function();
			// mdl.should.have.property('findAndCount').which.is.a.Function();
			mdl.should.have.property('max').which.is.a.Function();
			mdl.should.have.property('min').which.is.a.Function();
			mdl.should.have.property('sum').which.is.a.Function();
			mdl.should.have.property('build').which.is.a.Function();
			mdl.should.have.property('create').which.is.a.Function();
			// mdl.should.have.property('findOrInitialize').which.is.a.Function();
			mdl.should.have.property('findOrCreate').which.is.a.Function();
			// mdl.should.have.property('findCreateFind').which.is.a.Function();
			mdl.should.have.property('upsert').which.is.a.Function();
			// mdl.should.have.property('bulkCreate').which.is.a.Function();
			// mdl.should.have.property('truncate').which.is.a.Function();
			mdl.should.have.property('destroy').which.is.a.Function();
			// mdl.should.have.property('restore').which.is.a.Function();
			mdl.should.have.property('update').which.is.a.Function();
			// mdl.should.have.property('describe').which.is.a.Function();
		});
	});

	describe('#scope', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return a mock Model object', function () {
			mdl.scope().should.be.instanceOf(Model);
		});
	});

	describe('#sync', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return a promise', function () {
			mdl.sync().should.be.instanceOf(Promise);
		});
	});

	describe('#drop', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return a promise', function () {
			mdl.drop().should.be.instanceOf(Promise);
		});
	});

	describe('#build', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should pass along the default values and the override values to Instance in a combined object', function () {
			mdl._defaults = {
				'foo': 'bar'
			};
			var vals = {
				'baz': 'bin'
			};

			var inst = mdl.build(vals);
			var passed = inst._args[0];
			passed.should.have.property('foo').which.is.exactly('bar');
			passed.should.have.property('baz').which.is.exactly('bin');
		});

		it('should build Instance with Instance.prototype functions', function () {
			mdl.Instance.prototype.bar = function () { };

			var inst = mdl.build();
			inst.should.be.instanceOf(InstanceMock);
			inst.should.have.property('bar').which.is.exactly(mdl.Instance.prototype.bar);
		});
	});

	describe('#create', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should create Instance with Instance.prototype functions', async function () {
			var vals = {
				'baz': 'bin'
			};

			let query = await mdl.create(vals);
			let inst = await query.fallbackFn();
			inst.should.be.instanceOf(InstanceMock);
			inst._args[0].should.have.property('baz').which.is.exactly('bin');

		});
	});

	describe('#update', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should pass back default of 1 row updated', async function () {
			var vals = {
				'baz': 'bin'
			};
			let res = await mdl.update(vals);
			let [number, rows] = await res.fallbackFn()
			number.should.equal(1);
		});

		it('should pass back row updated when returning option is included', async function () {
			var vals = {
				'baz': 'bin'
			};

			let res = await mdl.update(vals, { returning: true });
			let [number, rows] = await res.fallbackFn()
			rows.should.be.Array();
			rows[0]._args[0].should.have.property('baz').which.is.exactly('bin');

		});

		it('should not pass back row updated when returning option is set to false', async function () {
			var vals = {
				'baz': 'bin'
			};

			let res = await mdl.update(vals, { returning: false });
			let [number, rows] = await res.fallbackFn()
			number.should.be.equal(1);
			should.not.exist(rows);
		});


		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.update().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var vals = {};
			var opts = {};

			mdl.$query = function (options) {
				options.query.should.equal('update');
				options.queryOptions.length.should.equal(2);
				options.queryOptions[0].should.equal(vals);
				options.queryOptions[1].should.equal(opts);
				done();
			}
			mdl.update(vals, opts);
		});
	});

	describe('#findOne', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should find a row with no options given', async function () {
			let res = await mdl.findOne()
			let inst = await res.fallbackFn()
			should.exist(inst)
			inst.should.be.instanceOf(InstanceMock);
		});

		it('should find a row with the values from the `where` query', async function () {
			var options = {
				where: {
					'foo': 'bar',
				},
			};

			let res = await mdl.findOne(options)
			let inst = await res.fallbackFn()
			inst._args[0].should.have.property('foo').which.is.exactly('bar');
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.findOne().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {
				where: {
					'foo': 'bar',
				},
			};

			mdl.$query = function (options) {
				options.query.should.equal('findOne');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.findOne(queryOptions);
		});
	});

	describe('#findById', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should find a row with the given id', async function () {
			let res = await mdl.findById(1234);
			let inst = await res.fallbackFn();
			inst._args[0].id.should.equal(1234);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.findById().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			mdl.$query = function (options) {
				options.query.should.equal('findById');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(123);
				done();
			}
			mdl.findById(123);
		});
	});

	describe('#<sum/min/max>', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return the default value for the field', async function () {
			mdl._defaults.foo = 1234;

			let res = await mdl.sum('foo')
			let count = await res.fallbackFn()
			count.should.equal(1234);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.sum().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {};

			mdl.$query = function (options) {
				options.query.should.equal('sum');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.sum(queryOptions);
		});
	});

	describe('#upsert', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return the createdDefault value for the model', async function () {
			let res = await mdl.upsert();
			let created = await res.fallbackFn();
			created.should.equal(mdl.options.createdDefault);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.upsert().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {};

			mdl.$query = function (options) {
				options.query.should.equal('upsert');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.upsert(queryOptions);
		});
	});

	describe('#findOrCreate', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should pass along where value to Instance creation', async function () {
			var options = {
				where: {
					'foo': 'bar',
				},
			};

			let res = await mdl.findOrCreate(options)
			let [inst, created] = await res.fallbackFn()
			inst._args[0].should.have.property('foo').which.is.exactly('bar');
		});

		it('should return the createdDefault value for the model', async function () {
			let res = await mdl.findOrCreate({})
			let [inst, created] = await res.fallbackFn();
			created.should.equal(mdl.options.createdDefault);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.findOrCreate().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {};

			mdl.$query = function (options) {
				options.query.should.equal('findOrCreate');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.findOrCreate(queryOptions);
		});
	});

	describe('#bulkCreate', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should create each model in the passed array', async function () {
			var vals = [
				{
					'baz': 'bin'
				},
				{
					'qux': 'quuz'
				},
			];

			let res = await mdl.bulkCreate(vals);
			let arr = await res.fallbackFn();
			arr.should.be.an.Array();
			arr[0]._args[0].should.have.property('baz').which.is.exactly('bin');
			arr[1]._args[0].should.have.property('qux').which.is.exactly('quuz');
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.bulkCreate().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var set = {};
			var opt = {};

			mdl.$query = function (options) {
				options.query.should.equal('bulkCreate');
				options.queryOptions.length.should.equal(2);
				options.queryOptions[0].should.equal(set);
				options.queryOptions[1].should.equal(opt);
				done();
			}
			mdl.bulkCreate(set, opt);
		});
	});

	describe('#findAll', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should pass along where value to Instance creation', async function () {
			var options = {
				where: {
					'foo': 'bar',
				},
			};

			let query = await mdl.findAll(options);
			let rows = await query.fallbackFn()
			rows.length.should.equal(1);
			rows[0]._args[0].should.have.property('foo').which.is.exactly('bar');
		});

		it('should still find results if there is not options', async function () {
			let query = await mdl.findAll();
			let rows = await query.fallbackFn();
			rows.length.should.equal(1);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.findAll().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {};

			mdl.$query = function (options) {
				options.query.should.equal('findAll');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.findAll(queryOptions)
		});
	});

	describe('#findAndCountAll', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should pass along where value to Instance creation', async function () {
			var options = {
				where: {
					'foo': 'bar',
				},
			};

			let query = await mdl.findAndCountAll(options);
			let result = await query.fallbackFn()
			result.rows.length.should.equal(1);
			result.count.should.equal(1);
			result.rows[0]._args[0].should.have.property('foo').which.is.exactly('bar');
		});

		it('should still find results if there is not options', async function () {
			let query = await mdl.findAndCountAll()
			let result = await query.fallbackFn()
			result.count.should.equal(1);
			result.rows.length.should.equal(1);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.findAndCountAll().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {};

			mdl.$query = function (options) {
				options.query.should.equal('findAndCountAll');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.findAndCountAll(queryOptions)
		});
	});

	describe('#destroy', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return a default value of 1 for number of rows destroyed', async function () {
			let query = await mdl.destroy();
			let rows = await query.fallbackFn()
			rows.should.equal(1);

		});

		it('should return the limit for number of rows destroyed if that is passed in', async function () {
			let query = await mdl.destroy({
				limit: 5
			})
			let rows = await query.fallbackFn()
			rows.should.equal(5);
		});

		it('should not pass along a fallback function if auto fallback is turned off', function () {
			mdl.options.autoQueryFallback = false;
			should.not.exist(mdl.destroy().fallbackFn);
		});

		it('should pass query info to the QueryInterface instance', function (done) {
			var queryOptions = {};

			mdl.$query = function (options) {
				options.query.should.equal('destroy');
				options.queryOptions.length.should.equal(1);
				options.queryOptions[0].should.equal(queryOptions);
				done();
			}
			mdl.destroy(queryOptions);
		});
	});

	describe('#getTableName', function () {
		var mdl;
		beforeEach(function () {
			mdl = new Model('foo');
		});

		it('should return a default value of 1 for number of rows destroyed', function () {
			mdl.tableName = 'bar';

			mdl.getTableName().should.equal('bar');
		});
	});

});
