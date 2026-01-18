/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitialMigration1768537003505 {
    name = 'InitialMigration1768537003505'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "login" character varying(255) NOT NULL, "hash_password" character varying(255) NOT NULL, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "consumers" ("id" SERIAL NOT NULL, "money" numeric(10,2) NOT NULL DEFAULT '0', "user_id" integer NOT NULL, CONSTRAINT "UQ_f984e14f0ee97c4ed6c1a17909f" UNIQUE ("user_id"), CONSTRAINT "REL_f984e14f0ee97c4ed6c1a17909" UNIQUE ("user_id"), CONSTRAINT "PK_9355367764efa60a8c2c27856d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sellers" ("id" SERIAL NOT NULL, "money" numeric(10,2) NOT NULL DEFAULT '0', "user_id" integer NOT NULL, CONSTRAINT "UQ_83f4670f0e114d0be3731bade87" UNIQUE ("user_id"), CONSTRAINT "REL_83f4670f0e114d0be3731bade8" UNIQUE ("user_id"), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_2b901dd818a2a6486994d915a68" UNIQUE ("user_id"), CONSTRAINT "REL_2b901dd818a2a6486994d915a6" UNIQUE ("user_id"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stores" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "seller_id" integer NOT NULL, CONSTRAINT "UQ_540fd9716dec62b65e2d15a8ced" UNIQUE ("seller_id"), CONSTRAINT "REL_540fd9716dec62b65e2d15a8ce" UNIQUE ("seller_id"), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "price" numeric(10,2) NOT NULL, "store_id" integer NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" SERIAL NOT NULL, "consumer_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_928d81a21c7309805d4b8f75c3b" UNIQUE ("consumer_id", "product_id"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "consumer_to_product" ("id" SERIAL NOT NULL, "consumer_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "purchase_date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5ae9b425605a26079f2677d1249" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "store_to_product" ("id" SERIAL NOT NULL, "store_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_f076b52f87c1fa5f4cde8534401" UNIQUE ("store_id", "product_id"), CONSTRAINT "PK_cddadb524032a2716da21b0ef74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "consumers" ADD CONSTRAINT "FK_f984e14f0ee97c4ed6c1a17909f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD CONSTRAINT "FK_83f4670f0e114d0be3731bade87" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_540fd9716dec62b65e2d15a8ced" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_68863607048a1abd43772b314ef" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_39ac7a9c9ca086df490bdca502b" FOREIGN KEY ("consumer_id") REFERENCES "consumers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_7d0e145ebd287c1565f15114a18" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consumer_to_product" ADD CONSTRAINT "FK_fb37bedb827c7b3f23828cca363" FOREIGN KEY ("consumer_id") REFERENCES "consumers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consumer_to_product" ADD CONSTRAINT "FK_6c49166a0636b54e55522c1528b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store_to_product" ADD CONSTRAINT "FK_ea73a3bf4eb120250af21892091" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store_to_product" ADD CONSTRAINT "FK_57d8ce9c90eae9409b916bcd266" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "store_to_product" DROP CONSTRAINT "FK_57d8ce9c90eae9409b916bcd266"`);
        await queryRunner.query(`ALTER TABLE "store_to_product" DROP CONSTRAINT "FK_ea73a3bf4eb120250af21892091"`);
        await queryRunner.query(`ALTER TABLE "consumer_to_product" DROP CONSTRAINT "FK_6c49166a0636b54e55522c1528b"`);
        await queryRunner.query(`ALTER TABLE "consumer_to_product" DROP CONSTRAINT "FK_fb37bedb827c7b3f23828cca363"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_7d0e145ebd287c1565f15114a18"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_39ac7a9c9ca086df490bdca502b"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_68863607048a1abd43772b314ef"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_540fd9716dec62b65e2d15a8ced"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP CONSTRAINT "FK_83f4670f0e114d0be3731bade87"`);
        await queryRunner.query(`ALTER TABLE "consumers" DROP CONSTRAINT "FK_f984e14f0ee97c4ed6c1a17909f"`);
        await queryRunner.query(`DROP TABLE "store_to_product"`);
        await queryRunner.query(`DROP TABLE "consumer_to_product"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "stores"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "sellers"`);
        await queryRunner.query(`DROP TABLE "consumers"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
