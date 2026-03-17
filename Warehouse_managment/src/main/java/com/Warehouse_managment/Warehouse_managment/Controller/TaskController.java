package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.TaskDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.TaskRequest;
import com.Warehouse_managment.Warehouse_managment.Enum.TaskStatus;
import com.Warehouse_managment.Warehouse_managment.Service.ProductService;
import com.Warehouse_managment.Warehouse_managment.Service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final ProductService productService;

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllTasks(){
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getTaskById(@PathVariable Long id){
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteTask(@PathVariable Long id){
        return ResponseEntity.ok(taskService.deleteTask(id));
    }

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> saveTask(@RequestBody TaskRequest taskRequest)
    {
        return ResponseEntity.ok(taskService.saveTask(taskRequest));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Response> getUserTasks(@PathVariable Long userId){
        return ResponseEntity.ok(taskService.getAllUserTasks(userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest taskRequest
    ){
        return ResponseEntity.ok(taskService.updateTask(id,taskRequest));
    }

    @PatchMapping("{id}/status")
    public ResponseEntity<Response> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @GetMapping("/search")
    public ResponseEntity<Response> searchTask(@RequestParam String input) {
        return ResponseEntity.ok(taskService.searchTaskByProductName(input));
    }


    @PostMapping("/assign-random")
    public ResponseEntity<Response> assignRandomTask(){
        return ResponseEntity.ok(taskService.assignNewRandomTaskToRandomManager());
    }








}
