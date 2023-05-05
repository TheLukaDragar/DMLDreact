export enum UserType {
    CLIENT = "Client",
    COURIER = "Courier",
    VEHICLE_OWNER = "Vehicle Owner",
}
export const UserTypesDescriptions = {
    [UserType.CLIENT]: 'A client is someone who requests a service.',
    [UserType.COURIER]: 'A courier is responsible for delivering goods.',
    [UserType.VEHICLE_OWNER]: 'A vehicle owner provides a vehicle for transportation.',
};

