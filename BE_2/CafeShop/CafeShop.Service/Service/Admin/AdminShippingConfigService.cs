using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using System.Threading.Tasks;
using System;

namespace CafeShop.Service.Service.Admin
{
    public class AdminShippingConfigService : IAdminShippingConfigService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminShippingConfigService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ShippingConfigDto> GetConfigAsync()
        {
            var config = await _unitOfWork.ShippingConfig.GetFirstOrDefaultAsync();
            if (config == null)
            {
                config = new ShippingConfig();
                await _unitOfWork.ShippingConfig.AddAsync(config);
                await _unitOfWork.SaveAsync();
            }

            return _mapper.Map<ShippingConfigDto>(config);
        }

        public async Task<ShippingConfigDto> UpdateConfigAsync(UpdateShippingConfigDto request)
        {
            var config = await _unitOfWork.ShippingConfig.GetFirstOrDefaultAsync();
            if (config == null)
            {
                config = new ShippingConfig();
                _mapper.Map(request, config);
                await _unitOfWork.ShippingConfig.AddAsync(config);
            }
            else
            {
                _mapper.Map(request, config);
                _unitOfWork.ShippingConfig.Update(config);
            }

            await _unitOfWork.SaveAsync();

            return _mapper.Map<ShippingConfigDto>(config);
        }
    }
}
