# Deploying BCStats Lockbox

## Database prep

1. Backup existing database
    oc exec bcstats-patroni-backup-769d494665-qfgj5 backup.sh -1
2. Copy database backup to local machine

## Update Secrets in Openshift

1. In common-object-management-service-master-passphrase update adminpass
2. Create bcstats-bcbox-keycloak
3. Create bcstats-bcbox-ches-service-account
4. In common-object-management-service-objectstorage update the username and password

## Preparing for COMS deployment

1. Determine which database is the main and copy the backup to the main DB.
    oc cp ./backups/patroni-bcstats-coms-app_20YY-MM-DD_TT-TT-TT.sql.gz postgres-master-db-XXXX-0:/tmp/patroni-bcstats-coms-app_20YY-MM-DD_TT-TT-TT.sql.gz -c database

2. Unzip the backup
    oc exec postgres-master-db-XXXX-0 -c database -- gunzip /tmp/patroni-bcstats-coms-app_20YY-MM-DD_TT-TT-TT.sql.gz

3. Take a backup of the clean database in case we need to roll back
    oc exec postgres-master-db-XXXX-0 -c database -- pg_dump -U postgres -d app --no-owner --no-privileges -f /tmp/current_db_backup.sql

4. Verify the backup of clean database was created
    oc exec postgres-master-db-XXXX-0 -c database -- ls -la /tmp/current_db_backup.sql

5. Clear out any data that may have been generated into the database before restoring the backup
    oc exec postgres-master-db-XXXX-0 -c database -- psql -U postgres -d app -c "
    -- Clear existing data but keep schema
    TRUNCATE TABLE public.version_tag RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.version_metadata RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.version RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.object_permission RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.object RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.bucket_permission RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.bucket RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.tag RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.metadata RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.permission RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.identity_provider RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.user RESTART IDENTITY CASCADE;
    "

6. Restore previous backup to new database
    oc exec postgres-master-db-XXXX-0 -c database -- psql -U postgres -d app -c "SET session_replication_role = replica;" -f /tmp/patroni-bcstats-coms-app_20YY-MM-DD_TT-TT-TT.sql

7. Verify that the restore worked
    oc exec postgres-master-db-XXXX-0 -c database -- psql -U postgres -d app -c "
    SELECT 'identity_providers' as table_name, count() as count FROM identity_provider
    UNION ALL SELECT 'permissions', count() FROM permission
    UNION ALL SELECT 'users', count() FROM public.user
    UNION ALL SELECT 'buckets', count() FROM bucket
    UNION ALL SELECT 'objects', count() FROM object
    UNION ALL SELECT 'versions', count() FROM version
    UNION ALL SELECT 'bucket_permissions', count() FROM bucket_permission
    UNION ALL SELECT 'object_permissions', count() FROM object_permission
    UNION ALL SELECT 'metadata', count() FROM metadata
    UNION ALL SELECT 'tags', count() FROM tag
    UNION ALL SELECT 'audit_logs', count() FROM audit.logged_actions
    UNION ALL SELECT 'queue_items', count() FROM queue.object_queue
    ORDER BY table_name;
    "
