package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.TaskDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.TaskRequest;
import com.Warehouse_managment.Warehouse_managment.Enum.TaskStatus;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.Task;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.TaskRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ModelMapper modelMapper;
    private  final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public Response getAllTasks() {
        List<Task> taskList = taskRepository.findAll();

        List<TaskDTO> taskDTOList = modelMapper.map(taskList, new TypeToken<List<TaskDTO>>() {}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .tasks(taskDTOList)
                .build();
    }

    @Override
    public Response getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .task(modelMapper.map(task, TaskDTO.class))
                .build();
    }

    @Override
    public Response deleteTask(Long id) {
        taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task Not Found"));

        taskRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Task Deleted Successfully")
                .build();

    }

    @Override
    public Response saveTask(TaskRequest taskRequest) {

        //check if product and user exist and get the object to build the task
        Product product = productRepository.findById(taskRequest.getProductId())
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        User user = userRepository.findById(taskRequest.getUserId())
                .orElseThrow(() -> new NotFoundException("User Not Found"));
        //build a task object based on the request and save to the database
        Task task = Task.builder()
                .name(taskRequest.getName())
                .description(taskRequest.getDescription())
                .product(product)
                .user(user)
                .deadline(taskRequest.getDeadline())
                .status(TaskStatus.ASSIGNED)
                .build();
        taskRepository.save(task);
        return Response.builder()
                .status(200)
                .message("Task Saved Successfully")
                .build();

    }

    @Override
    public Response searchTaskByProductName(String input) {
        List<Task> matchedTasks = taskRepository.findAllByProduct_NameContainingOrProduct_DescriptionContaining(input,input);
        if (matchedTasks.isEmpty()){
            throw new NotFoundException("No Task Found for this Product");
        }

        List<TaskDTO> taskDTOList = modelMapper.map(matchedTasks, new TypeToken<List<TaskDTO>>() {}.getType());
        return Response.builder()
                .status(200)
                .message("success")
                .tasks(taskDTOList)
                .build();
    }

    @Override
    public Response assignNewRandomTaskToRandomManager() {
        Product randomProduct = productRepository.findRandomProduct()
                .orElseThrow(() -> new NotFoundException("No Product Found"));

        User randomManagerUser = userRepository.findRandomManagerUser()
                .orElseThrow(() -> new NotFoundException("No Manager Found"));

        Task newRandomGeneratedTask = new Task();
        newRandomGeneratedTask.setProduct(randomProduct);
        newRandomGeneratedTask.setUser(randomManagerUser);
        newRandomGeneratedTask.setDeadline(newRandomGeneratedTask.getCreatedAt().plusDays(2));
        newRandomGeneratedTask.setName("Check product: "+randomProduct.getName());
        newRandomGeneratedTask.setStatus(TaskStatus.ASSIGNED);
        taskRepository.save(newRandomGeneratedTask);



        return Response.builder()
                .status(200)
                .message("New Task Generated Successfully" + newRandomGeneratedTask)
                .task(modelMapper.map(newRandomGeneratedTask, TaskDTO.class))
                .build();

    }

    @Override
    public Response updateTask(Long id, TaskRequest taskRequest) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task Not Found"));
        if (taskRequest.getStatus() != null) existingTask.setStatus(taskRequest.getStatus());
        if (taskRequest.getName() != null) existingTask.setName(taskRequest.getName());
        if (taskRequest.getDescription() != null) existingTask.setDescription(taskRequest.getDescription());
        if (taskRequest.getUserId() != null && taskRequest.getUserId()>0){
            User user = userRepository.findById(taskRequest.getUserId())
                    .orElseThrow(() -> new NotFoundException("User Not Found"));
            existingTask.setUser(user);
        }
        if (taskRequest.getProductId() != null && taskRequest.getProductId()>0){
            Product product = productRepository.findById(taskRequest.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));
            existingTask.setProduct(product);
        }
        if (taskRequest.getDeadline() != null) existingTask.setDeadline(taskRequest.getDeadline());
        taskRepository.save(existingTask);

        return Response.builder()
                .status(200)
                .message("Task Updated Successfully")
                .build();
    }

    @Override
    public Response getAllUserTasks(Long userId) {
        List<Task> matchedTasks = taskRepository.findAllByUserId(userId);

        List<TaskDTO> taskDTOList = modelMapper.map(matchedTasks, new TypeToken<List<TaskDTO>>() {}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .tasks(taskDTOList)
                .build();
    }

    @Override
    public Response updateTaskStatus(Long taskId, TaskStatus status) {
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task Not Found"));
        existingTask.setStatus(status);
        taskRepository.save(existingTask);

        return Response.builder()
                .status(200)
                .message("Task Status Updated Successfully")
                .build();
    }
}