docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Testtest123@" \
   -p 1433:1433 --name bed-assignment --hostname bed-assignment \
   -d \
   --platform linux/amd64 \
   mcr.microsoft.com/mssql/server:2022-latest
