# Generated by Django 3.1.4 on 2021-11-29 18:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_create_user_resource_view'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE VIEW users_user_map_vw as (
                    WITH rank_table as (
                        WITH tmp_raw as (
                                SELECT
                                    ur1.user_id as user_id,
                                    ur2.user_id as related_user_id,
                                    ur1.resource_type as resource_type,
                                    ur1.resource_id as resource_id,
                                    CASE
                                        WHEN ur1.resource_type = 'team' THEN 2
                                        WHEN ur1.resource_type = 'organization' THEN 3
                                        ELSE 1
                                        END as scope_rank
                            FROM users_resources_vw ur1
                                INNER JOIN users_resources_vw ur2
                                    ON ur1.resource_id = ur2.resource_id
                        )
                        SELECT
                            user_id,
                            related_user_id,
                            resource_id,
                            resource_type,
                            scope_rank,
                            ROW_NUMBER() OVER(PARTITION BY user_id, related_user_id, resource_id, resource_type
                                            ORDER BY scope_rank)  as rank
                        FROM tmp_raw
                    )
                    SELECT user_id,
                        related_user_id,
                        resource_id,
                        resource_type,
                        CASE
                            WHEN scope_rank = 3 then 'organization'
                            WHEN scope_rank = 2 then 'team'
                            ELSE 'direct'
                        END AS relationship_scope
                    FROM rank_table
                    WHERE rank = 1
                );
            """,
            reverse_sql="""
                DROP VIEW users_user_map_vw;
            """
        )
    ]
