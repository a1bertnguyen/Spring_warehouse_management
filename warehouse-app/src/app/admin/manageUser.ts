import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MOCK_USERS } from "../data";
import { FormControl, FormGroup,ReactiveFormsModule, Validators } from "@angular/forms";
import { userService } from "../service/userService";

@Component({
    selector:'manage-user',
    imports:[ReactiveFormsModule, CommonModule],
    templateUrl:'./html/manageUser.html',
    styleUrls:['./css/manageUser.css']
})

export class manageUser{
    users: any[] = [];

    message = "";
    error = "";

    showEditUserForm = false;
    selectedUser: any = null;

    constructor(private userService: userService) {}

    ngOnInit() {
        this.loadUsers();
    }

    editUserForm = new FormGroup({
        name: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required)
    });

    private loadUsers() {
        this.userService.getAllUser().subscribe({
            next: users => this.users = users,
            error: () => this.error = "Failed to load users"
        });
    }

    openEditUserModal(user: any) {
        this.selectedUser = user;
        this.showEditUserForm = true;

        this.editUserForm.patchValue({
            name: user.name,
            phone: user.phoneNumber,
        });
    }

    closeModal() {
        this.showEditUserForm = false;
        this.selectedUser = null;
    }

    editUser(id: number) {
        if (this.editUserForm.invalid) {
            this.error = "All fields are required";
            return;
        }

        const updated = {
            name: this.editUserForm.value.name,
            phoneNumber: this.editUserForm.value.phone,
        };

        this.userService.updateUser(id, updated).subscribe({
            next: () => {
                this.message = "User updated successfully";
                this.loadUsers();
            },
            error: () => this.error = "Failed to update user"
        });
        this.closeModal();
    }

    deleteUser(id: number) {
        this.userService.deleteUser(id).subscribe({
        next: () => {
            this.message = "User deleted successfully",
            this.loadUsers()
        },
        error: () => this.error = "Failed to delete user"
        });
    }
}