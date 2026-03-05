import { MigrationInterface, QueryRunner } from "typeorm";

export class IdxDestinationDescriptionAdd1772721560356 implements MigrationInterface {
    name = 'IdxDestinationDescriptionAdd1772721560356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_destination_description" ON "destination" ("description") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_destination_description"`);
    }

}
