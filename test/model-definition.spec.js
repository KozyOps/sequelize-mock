'use strict';

var should = require('should');
var Sequelize = require('../src/index.js');

describe('Model Definition Integration', function () {

    describe('modelDefinition property', function () {
        it('should be available on models defined with sequelize.define()', function () {
            var sequelize = new Sequelize();
            var modelDef = {
                'name': 'STRING',
                'email': 'STRING',
                'age': 'INTEGER',
            };

            var User = sequelize.define('User', modelDef);

            User.should.have.property('modelDefinition').which.is.an.Object();
            User.modelDefinition.should.equal(modelDef);
            User.modelDefinition.should.have.property('name').which.is.exactly('STRING');
            User.modelDefinition.should.have.property('email').which.is.exactly('STRING');
            User.modelDefinition.should.have.property('age').which.is.exactly('INTEGER');
        });

        it('should be accessible through model instances', function () {
            var sequelize = new Sequelize();
            var modelDef = {
                'title': 'STRING',
                'content': 'TEXT',
                'published': 'BOOLEAN',
            };

            var Post = sequelize.define('Post', modelDef);
            var post = Post.build();

            post.Model.should.have.property('modelDefinition').which.is.an.Object();
            post.Model.modelDefinition.should.equal(modelDef);
            post.Model.modelDefinition.should.have.property('title').which.is.exactly('STRING');
            post.Model.modelDefinition.should.have.property('content').which.is.exactly('TEXT');
            post.Model.modelDefinition.should.have.property('published').which.is.exactly('BOOLEAN');
        });

        it('should work with Sequelize DataTypes', function () {
            var sequelize = new Sequelize();
            var modelDef = {
                'name': sequelize.STRING,
                'age': sequelize.INTEGER,
                'active': sequelize.BOOLEAN,
            };

            var User = sequelize.define('User', modelDef);

            User.should.have.property('modelDefinition').which.is.an.Object();
            User.modelDefinition.should.equal(modelDef);
            User.modelDefinition.should.have.property('name').which.is.exactly(sequelize.STRING);
            User.modelDefinition.should.have.property('age').which.is.exactly(sequelize.INTEGER);
            User.modelDefinition.should.have.property('active').which.is.exactly(sequelize.BOOLEAN);
        });

        it('should handle empty model definitions', function () {
            var sequelize = new Sequelize();
            var modelDef = {};

            var EmptyModel = sequelize.define('EmptyModel', modelDef);

            EmptyModel.should.have.property('modelDefinition').which.is.an.Object();
            EmptyModel.modelDefinition.should.equal(modelDef);
            Object.keys(EmptyModel.modelDefinition).should.have.length(0);
        });
    });

});
