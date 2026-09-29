
import { configureStore } from '@reduxjs/toolkit';
import { usersApi } from './services/usersApi';
import { etablissementsApi } from './services/etablissementsApi';
import { publicationsApi } from './services/publicationsApi';
import { authApi } from './services/authApi';
import globalReducer from "./services/globalSlice";
import { tagsApi } from './services/tagsApi';
import { managerRoutesApi } from './services/managerRoutesApi';
import { ManagerPermissionsApi } from './services/ManagerPermissions';
import { managerRolePermissionApi } from './services/managerRolePermissionApi';
import { managerAuthApi } from './services/managerAuthApi';
import { prospectsApi } from './services/ProspectApi';
import { opportuniteApi } from './services/opportuniteApi';
import { convertUserAndEtabApi } from './services/ConvertUserAndEtab';
import { activiteHistoriqueApi } from "./services/activiteHistoriqueApi";
import { accountActivityApi } from "./services/accountActivityApi";
import { equipeApi } from './services/equipeApi';
import { membresApi } from './services/membresApi';
import { whatsappApi } from './services/whatsappApi';
import { userPermissionApi } from './services/userPermissionApi';
import { paymentsApi } from './services/paymentsApi'; 

export const store = configureStore({
  reducer: {
    global: globalReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [etablissementsApi.reducerPath]: etablissementsApi.reducer,
    [publicationsApi.reducerPath]: publicationsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [tagsApi.reducerPath]: tagsApi.reducer,
    [managerRoutesApi.reducerPath]: managerRoutesApi.reducer,
    [ManagerPermissionsApi.reducerPath]: ManagerPermissionsApi.reducer,
    [managerRolePermissionApi.reducerPath]: managerRolePermissionApi.reducer,
    [managerAuthApi.reducerPath]: managerAuthApi.reducer,
    [prospectsApi.reducerPath]: prospectsApi.reducer,
    [opportuniteApi.reducerPath]: opportuniteApi.reducer,
    [convertUserAndEtabApi.reducerPath]: convertUserAndEtabApi.reducer,
    [activiteHistoriqueApi.reducerPath]: activiteHistoriqueApi.reducer,
    [accountActivityApi.reducerPath]: accountActivityApi.reducer,
    [equipeApi.reducerPath]: equipeApi.reducer,
    [membresApi.reducerPath]: membresApi.reducer,
    [whatsappApi.reducerPath]: whatsappApi.reducer,
    [userPermissionApi.reducerPath]: userPermissionApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    .concat(usersApi.middleware)
    .concat(etablissementsApi.middleware)
    .concat(publicationsApi.middleware)
    .concat(authApi.middleware)
    .concat(tagsApi.middleware)
    .concat(managerRoutesApi.middleware)
    .concat(ManagerPermissionsApi.middleware)
    .concat(managerRolePermissionApi.middleware)
    .concat(managerAuthApi.middleware)
    .concat(prospectsApi.middleware)
    .concat(opportuniteApi.middleware)
    .concat(convertUserAndEtabApi.middleware)
    .concat(activiteHistoriqueApi.middleware)
    .concat(accountActivityApi.middleware)
    .concat(equipeApi.middleware)
    .concat(whatsappApi.middleware)
    .concat(membresApi.middleware)
    .concat(userPermissionApi.middleware)
    .concat(paymentsApi.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch