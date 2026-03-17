package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.TaskRequest;
import com.Warehouse_managment.Warehouse_managment.Enum.TaskStatus;

public interface TaskService {
    Response getAllTasks();

    Response getTaskById(Long id);

    Response deleteTask(Long id);

    Response saveTask(TaskRequest taskRequest);

    Response searchTaskByProductName(String input);

    Response assignNewRandomTaskToRandomManager();

    Response updateTask(Long id, TaskRequest taskRequest);

    Response getAllUserTasks(Long userId);

    Response updateTaskStatus(Long taskId, TaskStatus status);
}
