package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Enum.StockInwardStatus;
import com.Warehouse_managment.Warehouse_managment.Model.StockInward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StockInwardService {
    long count();

    List<StockInward> findAll();

    Optional<StockInward> findById(Integer id);

    StockInward save(StockInward stockInward);

    void deleteById(Integer id);

    List<StockInward> findByStatus(StockInwardStatus status);

    void updateStatus(Integer id, StockInwardStatus status); // thêm
    Page<StockInward> filter(
            StockInwardStatus status,
            String inwardCode,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);
    Page<StockInward> pageByStatus(StockInwardStatus status, Pageable pageable);

    Page<StockInward> filterByManager(
            StockInwardStatus status,
            String inwardCode,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Integer userId,
            Integer supplierId,
            Pageable pageable
    );

    List<StockInwardDTO> getAllStockInwards();

    StockInwardDTO getStockInwardById(Integer id);

    List<StockInwardDetailDTO> getDetailsByStockInwardId(Integer stockInwardId);

}
